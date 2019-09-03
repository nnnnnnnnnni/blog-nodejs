module.exports={
    getTime:function(data){
        if(data){
            var time = new Date(data)
        }else {
            var time = new Date()
        }
        var day = time.getDate();
        var month = time.getMonth()+1 >=10?(time.getMonth()+1).toString():'0'+(time.getMonth()+1).toString()
        var year = time.getFullYear()
        return date = year+'-'+month+'-'+day
    }
}