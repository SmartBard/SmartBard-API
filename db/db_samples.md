### SOME EXAMPLES OF USING DB INTERFACE FUNCTIONS
```javascript
getUsers().then((res) => {
    console.log(res.rows);
});
```

```javascript
var fields = 'title, body, date_from, date_to, status, priority, creation_time';
var values = "'Sports Day', 'Fridays sport will be volleyball', TIMESTAMP '2023-02-03 07:00:00', TIMESTAMP '2023-02-10 07:00:00', 'REQUESTED', 'true', TIMESTAMP '2023-02-02 10:00:00'"
createAnnouncement(fields, values).then((res) => {
    console.log(res.command);
});
```

```javascript
var fields = 'title, body, date_from, date_to, status, priority, creation_time';
var values = "'Sports Day', 'Fridays sport will be volleyball', TIMESTAMP '2023-02-03 07:00:00', TIMESTAMP '2023-02-10 07:00:00', 'REQUESTED', 'true', TIMESTAMP '2023-02-02 10:00:00'"
createAnnouncement(fields, values).then((res) => {
    console.log(res.command);
});
```

```javascript
var col = 'status';
var newValue = "'APPROVED'";
var announceID = 2;
updateAnnouncement(col, newValue, announceID).then((res) => {
    console.log(res.command);
});
```
