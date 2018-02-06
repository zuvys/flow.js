```javascript

function error(e){
    console.log('错误日志:'+e)
}
 
function say123(cont,err){
    window.e=err
    try{
        console.log(123)
        afasdfds
        cont()
    }
    catch(e){
        if(err) err(e)
        cont()
    }
}

function forArray(cont,item,i){
      setTimeout(function(){
        console.log('第'+(i+1)+'个元素'+item)
        cont()
    })
}

Flow.then(say123,error).for([1,2,3],forArray).start()

Flow.then(function(cont){
    setTimeout(function(){
        console.log(123)
        cont()
    },2000)
})
.for([1,2,3],function(cont,item,i){
    setTimeout(function(){
        console.log('第'+(i+1)+'个元素'+item)
        cont()
    })
})
.start()

//new Flow()
//.forAsync([],function(cont,log){
//  非顺序循环
//})
//.then(function(cont,log){
//  
//})
//.async([function(cont,log){
//  非顺序调用function数组
//}])
//.fail(function(){
//  log    
//})

```

协议
MIT