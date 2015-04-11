// Oracle Dashboard via blessed-contrib
//
// egorst@gmail.com

var oracledb = require('oracledb')
var blessed  = require('blessed')
var contrib  = require('blessed-contrib')

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

//var grid = new contrib.grid({rows:60,cols:30, screen: screen})

var tabsysmetric = contrib.table(
    { 
        keys: false,
        label: "instance sysmetrics",
        border: {type: "line"},
        width: 96,
        height: 10, 
        columnSpacing: 4,
        columnWidth: [10,16,16,16,16]
    }
);

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

var sparkUserIO = contrib.sparkline(
    { 
        label: 'DB Time (last 60 minutes)',
        tags: true,
        border: {type: 'line'},
        top: 20,
        style: {fg: 'lightblue'}
    }
);


screen.append(tabsysmetric);
screen.append(sparkUserIO);

screen.key(['escape','q'], function (ch,key) { return process.exit(0); });

tabsysmetric.focus()

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
            var tabdata = [];
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
            for (iname in instances) {
                var trow = []
                trow.push(iname)
                for (m in res[iname]) {
                    trow.push(res[iname][m].toFixed(4))
                }
                tabdata.push(trow)
            }
            tabsysmetric.setData({
                headers: ["InstId","OS Load","I/O Mb per Sec","SQL Service Resp Time","UserCalls per Sec"],
                data: tabdata}
            );
            sparkUserIO.setData(
                ['User I/O'],
                [[100,0,22,8,1,100,100,15]]
            );
            screen.render();
        }
        selectData(err,connection);
    }, timer
    );
}

