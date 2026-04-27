# LG ScreenBoard — Installation Steps

Complete guide to package and deploy LG ScreenBoard to an LG webOS TV from a Windows PC.

---

## Prerequisites

| Tool | Version | Install Command |
|------|---------|----------------|
| Node.js | ≥ 18 (tested on v24) | https://nodejs.org |
| webOS TV CLI (`@webos-tools/cli`) | 3.2.3 | `npm install -g @webos-tools/cli` |
| OpenSSL | any | bundled with Git for Windows |
| Python 3 | ≥ 3.9 | https://python.org (optional — used for scripted key setup) |

Verify the CLI is installed:
```bash
ares-package --version
# → Version: 3.2.3
```

---

## Step 1 — Enable Developer Mode on the TV

1. On your LG TV remote press: **Home → Settings → All Settings → General → About This TV**
2. Rapidly click the LG logo 5 times to reveal the hidden developer menu.  
   *Alternative path on some firmware:* **Home → LG Content Store → search "Developer Mode"**)
3. Open the **Developer Mode** app from the LG Content Store (install it if missing).
4. Toggle **Developer Mode ON** and note the **IP address** and **passphrase** shown on screen.
5. Reboot the TV when prompted.

> **Your TV details used in this install:**  
> IP Address: `10.0.0.80` · Port: `9922` · Username: `prisoner`

---

## Step 2 — Register the TV as a Device

```bash
ares-setup-device --add lgtv --info "{\"host\":\"10.0.0.80\",\"port\":9922,\"username\":\"prisoner\"}"
```

Verify it was added:
```bash
ares-setup-device --list
# lgtv   prisoner@10.0.0.80:9922   ssh   tv
```

---

## Step 3 — Retrieve the SSH Key from the TV

The Developer Mode app on the TV serves a one-time SSH key protected by its passphrase.

```bash
ares-novacom --device lgtv --getkey
# Prompted: input passphrase:  → type the passphrase shown in the Developer Mode app
```

**Passphrase used:** `CAC1FD`

The encrypted private key is saved to:
```
C:\Users\<you>\.ssh\lgtv_webos
```

---

## Step 4 — Decrypt the SSH Key (Node.js v22+ workaround)

`ares-cli` cannot use a passphrase-encrypted key on Node.js v22+. Decrypt it to a plain key:

```bash
openssl rsa \
  -in  "C:/Users/<you>/.ssh/lgtv_webos" \
  -out "C:/Users/<you>/.ssh/lgtv_webos_plain" \
  -passin pass:CAC1FD
# → writing RSA key
```

---

## Step 5 — Trust the TV's Host Key

```bash
ssh-keyscan -p 9922 10.0.0.80 >> C:/Users/<you>/.ssh/known_hosts
```

---

## Step 6 — Update the Device Config to Use the Plain Key

Edit `C:\Users\<you>\AppData\Roaming\.webos\tv\novacom-devices.json`.  
Find the `lgtv` entry and replace the `privateKeyName` field with:

```json
{
    "host": "10.0.0.80",
    "port": 9922,
    "username": "prisoner",
    "name": "lgtv",
    "profile": "tv",
    "type": "starfish",
    "files": "stream",
    "description": "LG ScreenBoard TV",
    "default": false,
    "password": "",
    "passphrase": "",
    "privateKey": {
        "openSsh": "lgtv_webos_plain"
    }
}
```

---

## Step 7 — Patch ares-cli for Node.js v24 Compatibility

`ssh2` (bundled with ares-cli 3.2.3) calls `util.isDate()` which was removed in Node.js v24.  
Edit the file:
```
C:\Users\<you>\AppData\Roaming\npm\node_modules\@webos-tools\cli\node_modules\ssh2\lib\protocol\SFTP.js
```

Change line 10 from:
```js
const { inherits, isDate } = require('util');
```
To:
```js
const { inherits } = require('util');
const isDate = (d) => d instanceof Date;
```

> This is a one-time fix. If you reinstall `@webos-tools/cli` you will need to re-apply it.

---

## Step 8 — Package the App

From the project root:

```bash
ares-package . --outdir ./build --no-minify
# → Create com.screenboard.app_1.0.0_all.ipk to ./build
# → Success
```

The `--no-minify` flag is required because the minifier in ares-cli 3.2.3 does not support modern JS syntax used in the app.

The output file is: `./build/com.screenboard.app_1.0.0_all.ipk`

---

## Step 9 — Install to the TV

```bash
ares-install --device lgtv ./build/com.screenboard.app_1.0.0_all.ipk
# → Installing package ...
# → Success
```

---

## Step 10 — Launch the App

```bash
ares-launch --device lgtv com.screenboard.app
# → Launched application com.screenboard.app
```

The app will also appear in **Home → My Apps** on the TV.

---

## Reinstalling / Updating

Every time you change the source code, repeat Steps 8–10:

```bash
# 1. Repackage
ares-package . --outdir ./build --no-minify

# 2. Reinstall (automatically replaces the existing install)
ares-install --device lgtv ./build/com.screenboard.app_1.0.0_all.ipk

# 3. Relaunch
ares-launch --device lgtv com.screenboard.app
```

---

## Closing / Removing the App

Close without uninstalling:
```bash
ares-launch --device lgtv --close com.screenboard.app
```

Uninstall completely:
```bash
ares-install --device lgtv --remove com.screenboard.app
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `All configured authentication methods failed` | Encrypted key or missing host key | Complete Steps 4–6 |
| `isDate is not a function` | Node.js v22+ removed `util.isDate` | Apply Step 7 patch |
| `Failed to minify code` | Minifier incompatible with modern JS | Use `--no-minify` flag |
| `The specified path does not exist <#000000>` | Unsupported fields in `appinfo.json` | Remove `bgColor`/`splashBackground` fields |
| `Host key verification failed` | TV not in `known_hosts` | Run Step 5 |
| Developer Mode passphrase expired | 50-hour session limit | Re-enable Dev Mode on TV and repeat Steps 3–4 |

---

## Notes

- Developer Mode sessions expire after **50 hours**. Re-enable it in the Developer Mode app on the TV before the session ends to reset the timer.
- The plain SSH key (`lgtv_webos_plain`) contains no passphrase — keep it private and do not commit it to version control.
- The `./build/` folder is excluded from git (see `.gitignore`).
