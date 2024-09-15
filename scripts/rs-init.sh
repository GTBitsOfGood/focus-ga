#!/bin/bash

mongosh "mongo1:30001" <<EOF
var config = {
    "_id": "rs0",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "mongo1:30001",
            "priority": 1
        },
        {
            "_id": 2,
            "host": "mongo2:30002",
            "priority": 0.5
        },
        {
            "_id": 3,
            "host": "mongo3:30003",
            "priority": 0.5
        }
    ]
};
rs.initiate(config, { force: true });
rs.status();
EOF