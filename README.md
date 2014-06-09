Shamus
--
Shamus (Yiddish) - A Private investigator

## Description
Shamus is a really basic port scanner written in Node.

## Installing
`git pull git://github.com/bwalker8038/shamus`

## Usage
To scan a port, run the following:
`shamus scanme.nmap.org -p 80`

Shamus will return a json object with informatio about the port
```json
{
  "connection": {
    hostname: "scanme.nmap.org",
    address: "129.168.1.1",
    family: "IPv4"
    port: 80,
    status: "open"
  },
  "service":
    "software": [
      "Apache/2.2.14 (Ubuntu)"
    ]
}
```

multiple ports can be added, and are seperated by a comma in the following fashion:

`shamus scanme.nmap.org -p 80,22`


