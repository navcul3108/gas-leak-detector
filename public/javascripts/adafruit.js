$.getScript("/javascripts/api-client.js")
var axiosInstance = null;
var feedsURL = null, AIOkey = null;

$("#confirm-info").click(function(){
    if($("#feeds-url").val()=="")
        alert("You must specify URL of Feeds")
    else if($("#aio-key").val()=="")
        alert("You must specify key of Feeds")
    else{
        feedsURL = $("#feeds-url").val();
        AIOkey = $("#aio-key").val();
        $(".btn-success").removeAttr("disabled")
    }
})

$(document).ready(function(){
    $(".form-control-range").change(function(e){
        const target = e.target;
        const h5Tag = $(target).siblings(".range-value");
        $(h5Tag).text($(target).val());
    })
    $()
})