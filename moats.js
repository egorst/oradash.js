// MOATS ( http://www.oracle-developer.net/content/utilities/moats.zip?p=1.06 ) in blessed interface 
//
// egorst@gmail.com

var oracledb = require('oracledb')
var blessed  = require('blessed')

oracledb.getConnection({
    user: 'tools',
    password: 'catch22',
    connectString: '' // local
}, selectData);

var screen = blessed.screen({
    autoPadding: true,
    smartCSR: true
});

screen.title = 'MOATS';

var box = blessed.box({
    width: '60%',
    height: '20%',
    tags: true,
    border: {
        type: 'line'
    }
});

screen.append(box);

screen.key(['escape','q'], function (ch,key) { return process.exit(0); });

box.focus;

function selectData(err,connection) {
    if (err) { console.error(err.message); return; }
    connection.execute("select sys_context('userenv','instance_name') from dual",displayData);
    function displayData(err,result) {
        if (err) { console.error(err.message); return; }
        box.setContent('Connected to {bold}'+result.rows[0][0]+'{/bold}');
        screen.render();
    }
}
