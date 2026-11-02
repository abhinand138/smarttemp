import subprocess
import os

ssid = "Hitler rameshan"
password = "12345678"
hex_ssid = ssid.encode("ascii").hex().upper()

xml_content = f"""<?xml version="1.0"?>
<WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1">
    <name>{ssid}</name>
    <SSIDConfig>
        <SSID>
            <hex>{hex_ssid}</hex>
            <name>{ssid}</name>
        </SSID>
    </SSIDConfig>
    <connectionType>ESS</connectionType>
    <connectionMode>auto</connectionMode>
    <MSM>
        <security>
            <authEncryption>
                <authentication>WPA2PSK</authentication>
                <encryption>AES</encryption>
                <useOneX>false</useOneX>
            </authEncryption>
            <sharedKey>
                <keyType>passPhrase</keyType>
                <protected>false</protected>
                <keyMaterial>{password}</keyMaterial>
            </sharedKey>
        </security>
    </MSM>
</WLANProfile>"""

xml_path = "hitler.xml"
with open(xml_path, "w", encoding="ascii") as f:
    f.write(xml_content)

add_res = subprocess.run(["netsh", "wlan", "add", "profile", f"filename={xml_path}"], capture_output=True, text=True)
print("Add profile result:", add_res.stdout)

conn_res = subprocess.run(["netsh", "wlan", "connect", f"name={ssid}"], capture_output=True, text=True)
print("Connect result:", conn_res.stdout)

if os.path.exists(xml_path):
    os.remove(xml_path)
