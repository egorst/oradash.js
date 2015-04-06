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
        connection.execute("select instance_number,instance_name,metric_name,value from gv$sysmetric natural join gv$instance where metric_name in ('Current OS Load','SQL Service Response Time','User Calls Per Sec','I/O Megabytes per Second') and round(intsize_csec/100)=60 order by instance_number,metric_name,value",displayData);
        timer = 15000;
        function displayData(err,result){
            var res = {};
            var instances = {};
            var metric = {};
            if (err) { console.error(err.message); return; }
            for (ind = 0; ind < result.rows.length; ind++) {
                instance_name = result.rows[ind][1];
                metric_name   = result.rows[ind][2];
                value         = result.rows[ind][3];
                metric[metric_name] = value;
                if (res[instance_name] == undefined) {
                    res[instance_name] = {};
                }
                res[instance_name][metric_name] = value;
                instances[instance_name] = 1;
            }
            var thead = "{white-bg}";
            var cntnt = thead+"InstId{default}\t"+thead+"OS Load{default}\t"+thead+"I/O Mb per Sec{default}\t"+thead+"SQL Service Resp Time{default}\t"+thead+"UserCalls per Sec{default}\n";
            for (iname in instances) {
                cntnt += iname+"\t\t";
                for (m in res[iname]) {
                    cntnt += res[iname][m].toFixed(4)+"\t\t";
                }
                cntnt += "\n";
            }
            //cntnt    += result.rows[0][0]+"\t"+result.rows[1][2]+"\t"+result.rows[2][2]+"\t"+result.rows[3][2]+"\n";
            //cntnt    += result.rows[2][0]+"\t"+result.rows[2][2]+"\t"+result.rows[2][2]+"\t"+result.rows[3][2]+"\n";
            //cntnt    += result.rows[3][0]+"\t"+result.rows[3][2]+"\t"+result.rows[2][2]+"\t"+result.rows[3][2]+"\n";
            boxsysmetric.setContent(cntnt);
            screen.render();
        }
        selectData(err,connection);
    }, timer
    );
}

