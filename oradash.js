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

var boxsysmetric = blessed.box({
    width: '60%',
    height: '20%',
    tags: true,
    border: {
        type: 'line'
    }
//    ,style: {
//        hover: {
//            bg: 'green'
//        }
//    }
});

screen.append(boxsysmetric);

screen.key(['escape','q'], function (ch,key) { return process.exit(0); });

boxsysmetric.focus;

var timer = 0;

function selectData(err,connection) {
    if (err) { console.error(err.message); return; }
    setTimeout(function() {
    //    connection.execute("select sys_context('userenv','instance_name') from dual",displayData);
        connection.execute("select metric_name,value from gv$sysmetric where metric_name in ('Current OS Load','SQL Service Response Time','User Calls Per Sec','I/O Megabytes per Second') and round(intsize_csec/100)=60 order by metric_name,value",displayData);
        timer = 15000;
        function displayData(err,result) {
            if (err) { console.error(err.message); return; }
            var cntnt = "'"+result.rows[0][0]+"': {bold}"+result.rows[0][1].toFixed(4)+'{/bold}'+"\n";
            cntnt    += "'"+result.rows[1][0]+"': {bold}"+result.rows[1][1].toFixed(4)+'{/bold}'+"\n";
            cntnt    += "'"+result.rows[2][0]+"': {bold}"+result.rows[2][1].toFixed(4)+'{/bold}'+"\n";
            cntnt    += "'"+result.rows[3][0]+"': {bold}"+result.rows[3][1].toFixed(4)+'{/bold}'+"\n";
            boxsysmetric.setContent(cntnt);
            screen.render();
        }
        selectData(err,connection);
    }, timer
    );
}

