$(function(){
    $('button.delete').on('click',function(event){
        var me      = $(this),
            form    = me.parents('form'),
            title   = me.data('title') || 'Make this change?';
        event.preventDefault();
        openActionDialog({
            message     : title,
            parent      : form[0].id,
            width       : window.innerWidth - 100,
            height      : window.innerHeight - 300,
            maxheight   : true
        });
    });
});