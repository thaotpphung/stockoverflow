// Mark current page
$(document).ready(function () {
  $(function () {
    $("a.nav-item.nav-link").each(function () {
      var $nav = $("#mainNav");
      if (window.location.href.includes($(this).prop("href"))) {
        $nav.find("a").removeClass("active");
        $(this).addClass("active");
      }
    });
  });
});

// function collapseNavbar() {
// 	$(document).scroll(function () {
// 		var $nav = $("#mainNav");
// 		$nav.toggleClass("scrolled", $nav.offset().top > 50);
//     });
// };
// $(window).scroll(collapseNavbar);
// $(document).ready(collapseNavbar);

// Show/ unshow the add stock option
// $(".fa-plus").click(function () {
//   $("input[type='text']").fadeToggle();
// });

// Delete a stock from table
// $("#tracked-stocks table").on("click", "span", function (event) {
//   console.log($(this).parent());
//   $(this)
//     .parent()
//     .parent()
//     .fadeOut(500, function () {
//       $(this).remove();
//     });
//   event.stopPropagation();
// });

// Add a stock to table
// $("input[type='text']").keypress(function (event) {
//   if (event.which === 13) {
//     //grabbing new stock text from input
//     var newStock = $(this).val();
//     // empty search box
//     $(this).val("");
//     //create a new table row
//     $("table").append(
//       "<tr><th scope='row'><span><i class='fa fa-trash'></i></span>" +
//         newStock +
//         "</th><td>APL</td><td>20.5</td><td>0.5</td><td>10</td><td><input type='checkbox'></td></tr>"
//     );
//   }
// });

var searchResult = document.getElementById("searchResult");
var searchStock = document.getElementById("searchStock");
$("#searchStock").keyup(function (event) {
  $("#searchResult").removeClass("d-none");
  if (event.which == 8 || (event.which >= 65 && event.which <= 90)) {
    var searchTerm = $(this).val().toUpperCase();
    searchQuery(searchTerm);
  }
});

$("#searchResult").delegate("div", "click", function (event) {
  var found = $(this).text();
  searchStock.value = found.split("-")[0].trim();
  $(this).parent().addClass("d-none");
});

function searchQuery(searchTerm) {
  var url = "http://localhost:3000/search";
  var params = "searchTerm=" + searchTerm;
  var http = new XMLHttpRequest();
  http.open("POST", url, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var obj = http.responseText;
      var parsed = JSON.parse(obj);
      var found = parsed.foundStock;
      if (found.length == 0) {
        // searchResult.innerHTML = "Can't find stock, search another term";
        searchResult.innerHTML =
          '<div class="notfound-mes">Can\'t find stock, search another term </div>';
      } else {
        searchResult.innerHTML = "";
        renderHTML(found);
      }
    }
  };
  http.send(params);
}

function renderHTML(found) {
  var htmlString = "";
  for (i = 0; i < found.length; i++) {
    if (i == 10) {
      break;
    }
    htmlString +=
      '<div class="search-item">' +
      found[i].symbol +
      " - " +
      found[i].name +
      " </div>";
  }
  searchResult.innerHTML = htmlString;
}

$(".editEmail").click((event) => {
  fadeForm($("#editEmailForm"));
  
});

$(".editFirst").click((event) => {
  fadeForm($("#editFirstForm"));
});

$(".editLast").click((event) => {
  fadeForm($("#editLastForm"));
});

function fadeForm($edit) {
  if ($edit.is(':visible')) {
    $edit.fadeOut(300, () => $edit.hide());
  } else {
    $edit.fadeIn(300, () => $edit.show());
  }
}
