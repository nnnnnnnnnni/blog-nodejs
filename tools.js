module.exports={
    getTime: function (theTime) {
        var time;

        if (theTime) {
            time = new Date(theTime);
        } else {
            time = new Date();
        }

        var year = time.getFullYear();
        var month = time.getMonth() + 1;
        var day = time.getDate();
        var hour = time.getHours();
        var min = time.getMinutes();
        var sec = time.getSeconds();
        var ret = '';
        if (day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }
        if (hour < 10) {
            hour = '0' + hour;
        }
        if (min < 10) {
            min = '0' + min;
        }
        if (sec < 10) {
            sec = '0' + sec;
        }
        ret = '' + year + '-' + month + '-' + day;
        return ret;
    },
}