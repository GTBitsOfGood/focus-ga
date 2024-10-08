@echo off
setlocal

rem Set MongoDB connection string
set MONGO_HOST=mongo1:30001

rem Create a temporary JavaScript file with the MongoDB configuration
echo var config = { > temp.js
echo     "_id": "rs0", >> temp.js
echo     "version": 1, >> temp.js
echo     "members": [ >> temp.js
echo         { >> temp.js
echo             "_id": 1, >> temp.js
echo             "host": "mongo1:30001", >> temp.js
echo             "priority": 1 >> temp.js
echo         }, >> temp.js
echo         { >> temp.js
echo             "_id": 2, >> temp.js
echo             "host": "mongo2:30002", >> temp.js
echo             "priority": 0.5 >> temp.js
echo         }, >> temp.js
echo         { >> temp.js
echo             "_id": 3, >> temp.js
echo             "host": "mongo3:30003", >> temp.js
echo             "priority": 0.5 >> temp.js
echo         } >> temp.js
echo     ] >> temp.js
echo }; >> temp.js
echo rs.initiate(config, { force: true }); >> temp.js
echo rs.status(); >> temp.js

rem Run the script with mongosh
mongosh %MONGO_HOST% < temp.js

rem Clean up the temporary file
del temp.js

endlocal
