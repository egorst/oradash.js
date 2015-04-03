// Oracle Dashboard in blessed
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

screen.title = 'Oracle Dashboard';

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
//    connection.execute("select sys_context('userenv','instance_name') from dual",displayData);
    connection.execute("select value from gv$sysmetric where metric_name='Consistent Read Gets Per Sec' and round(intsize_csec/100)=15",displayData);
    function displayData(err,result) {
        if (err) { console.error(err.message); return; }
        box.setContent('Consistent Read Gets Per Sec (last 15 sec) is {bold}'+result.rows[0][0]+'{/bold}');
        screen.render();
    }
}
