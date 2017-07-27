var perpage = 3;
var page = 1;
var pages = 0;
var comments = [];
$( function () {
    $("#messageBtn").on("click",()=>{
        $.ajax({
           type:"POST",
           url:"/api/comment/post",
           data:{
               contentid:$("#contentId").val(),
               content:$("#messageContent").val()
           },
            success : function(responseData){

                $("#messageContent").val("");
                comments = responseData.data.comments.reverse();
                renderComment();
            }
        });
    })
})

// 每次页面重载的时候还错一下文章的所有评论
$.ajax({
    type:"get",
    url:"/api/comment",
    data:{
        contentid:$("#contentId").val(),
    },
    success : function(responseData){
        comments = responseData.data.reverse();
        renderComment();

    }
});
$(".pager").delegate("#last","click",()=>{
    page--;
    renderComment();
})

$(".pager").delegate("#next","click",()=>{
    page++;
    renderComment();
})

function renderComment () {

        $("#messageCount").html(comments.length);

        pages =Math.max(1, Math.ceil(comments.length / perpage));

        var start =Math.max(0,(page-1)* perpage) ;
        var end = Math.min(start+ perpage,comments.length) ;

        var $lis = $(".pager li");
        $lis.eq(1).html(page + "/" + pages)

        if( page <= 1 ) {
            page = 1;
            $lis.eq(0).html("<span>没有上一页</span>");
        } else {
            $lis.eq(0).html("<a id='last' href='javascript:;'>上一页</a>");

        }
        if( page >= pages ) {
            page = pages;
            $lis.eq(2).html("<span>没有下一页</span>")
        } else {
            $lis.eq(2).html("<a id='next' href='javascript:;'>下一页</a>");

        }

        if (comments.length ==0) {
            $(".messageList").html("<div class='messageBox' ><p>还没有评论</p></div>");
        } else {
            var html ="";
            for( var i=start; i<end;i++){
                html+= ' <div class="messageBox">' +
                    '<p class="name clear"><span class="fl colInfo">'+comments[i].username+'</span><span class="fr colInfo">'+ formatDate(comments[i].postTime) +'</span></p>' +
                    '<p>'+ comments[i].content +'</p>\n' +
                    ' </div>';
                // console.log(comments,i,comments[i].username);
            }
            $('.messageList').html(html);
        }

}

function formatDate(d) {
    var date1 = new Date(d);
    return date1.getFullYear()+ '年' + (date1.getMonth()+1) + "月" + date1.getDate() + "日" + date1.getHours() + ":" + date1.getMinutes()+ ":" + date1.getSeconds();
}