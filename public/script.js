// function collapseNavbar() {
// 	$(document).scroll(function () {
// 		var $nav = $("#mainNav");
// 		$nav.toggleClass("scrolled", $nav.offset().top > 50);
//     });
// };
// $(window).scroll(collapseNavbar);
// $(document).ready(collapseNavbar);

// Mark current page
$(document).ready(function(){
    $(function () {
        $('a.nav-item.nav-link').each(function () {
            var $nav = $("#mainNav");
            if ($(this).prop('href') == window.location.href) {
                $nav.find("a").removeClass("active");
                $(this).addClass('active');
            }
        });
    });
})

// Show/ unshow the add stock option
$(".fa-plus").click(function(){
	$("input[type='text']").fadeToggle();
});

// Delete a stock from table
$("#tracked-stocks table").on("click", "span", function(event){
	console.log($(this).parent());
	$(this).parent().parent().fadeOut(500,function(){
		$(this).remove();
    });
	event.stopPropagation();
});

// Add a stock to table
$("input[type='text']").keypress(function(event){
	if(event.which === 13){
		//grabbing new stock text from input
		var newStock = $(this).val();
		// empty search box
		$(this).val("");
		//create a new table row
		$("table").append("<tr><th scope='row'><span><i class='fa fa-trash'></i></span>" + newStock + "</th><td>APL</td><td>20.5</td><td>0.5</td><td>10</td><td><input type='checkbox'></td></tr>");
	}	
});



