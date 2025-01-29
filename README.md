# fin-free
 Show free diskspace in irc with !df command

```
<Nja> !df
<@NiNJA> RACE: 0.49 TB of 3.44 TB free - Used 2.77 TB
<@NiNJA> ARCHIVE: 5.64 TB of 63.77 TB free - Used 56.67 TB
<@NiNJA> ARCHiVE-OFFSITE: 5.06 TB of 34.91 TB free - Used 29.85 TB
```

Add the devices like the df output on the shell. U can add as many as you want.. Just add a new:

```
,
    "archive_off_site": {
      "devices": ["/dev/sda5", "/dev/sdc1", "/dev/sdb1", "/dev/sdd1", "192.168.1.150:/volume4/ARCHiVE1","192.168.1.151:/volume8/ARCHiVE2"],
      "ircName": "ARCHiVE-OFFSITE"
    }

```

the same for the channels where the bot need to respond! Just add: 

```
,
 { "name": "#free-new", "blowfishKey": "somecbckey" }

```

```

{
  "server": {
    "host": "101.15.21.15",
    "port": 5050,
    "ssl": true,
    "nickname": "NiNJA",
    "connectstring": "somename/ninja:randompassword",
    "channels": [
      { "name": "#free-chat", "blowfishKey": "somecbckey" },
      { "name": "#free-staff", "blowfishKey": "somecbckey" }
    ]
  },
  "disks": {
    "incoming": {
      "devices": ["/dev/nvme0n1p1"], 
      "ircName": "RACE"
    },
    "archive": {
      "devices": ["/dev/sda5", "/dev/sdc1", "/dev/sdb1", "/dev/sdd1"],
      "ircName": "ARCHiVE"
    },
    "archive_off_site": {
      "devices": ["192.168.1.150:/volume4/ARCHiVE1","192.168.1.151:/volume8/ARCHiVE2"],
      "ircName": "ARCHiVE-OFFSITE"
    }
  }
}

```
