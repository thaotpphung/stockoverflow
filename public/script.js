// Mark current page
$(document).ready(function () {
  $(function () {
    $("a.nav-item.nav-link").each(function () {
      var $nav = $("#mainNav");
      if (window.location.href.includes($(this).prop("href"))) {
        $nav.find("a").removeClass("activeLink");
        $(this).addClass("activeLink");
      }
    });
  });
});

// Delete a stock from table
$(".fa-trash").click (function (event) {
  // await fadeRow($(this));
  $(this).parent().parent().parent().parent().fadeOut(500, function () {
    $(this).addClass("d-none");
    $("#deleteButton").trigger("click");
  });
  event.stopPropagation();
});

// -----------------------search-----------------------
var searchResult = document.getElementById("searchResult");
var searchStock = document.getElementById("searchStock");

// send request whenever user enter a valid string
$("#searchStock").keyup(function (event) {
  $("#searchResult").removeClass("d-none");
  if (event.which == 8 || (event.which >= 65 && event.which <= 90)) {
    var searchTerm = $(this).val().toUpperCase();
    searchQuery(searchTerm);
  } else if (event.which == 13) {
    $("#newButton").trigger("click");
  }
});


// listen for click on div to fill the search box with that value
$("#searchResult").delegate("div", "click", function (event) {
  var found = $(this).text();
  searchStock.value = found.split("-")[0].trim();
  $(this).parent().addClass("d-none");
});

// send request to server API for search query and return result
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

// display search result
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

// -----------------------User-----------------------
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

// -----------------------Test-----------------------
function togglePopup(){
  document.getElementById("popup-1").classList.toggle("active");
}


// -----------------------Update Stock price dynamically-----------------------

// $(".fa-sync-alt").click((event) => {
//   $prices = $("td.price");
//   // console.log($prices);
//   if ($prices.length > 0) {
//     var url = "http://localhost:3000/update";
//     var symbolList = [];
//     var params = "query=";
//     console.log(document.getElementsByClassName("symbol"));
//     for (i = 0; i < document.getElementsByClassName("symbol").length; i++) {
//       params += document.getElementsByClassName("symbol")[i].textContent + ","
//       symbolList.push({symbol: document.getElementsByClassName("symbol")[i].textContent});
//     }
//     params = params.substring(0, params.length - 1);
//     console.log(symbolList);
//     console.log(params);

//     var http = new XMLHttpRequest();
//     http.open("POST", url, true);
//     http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//     http.onreadystatechange = function () {
//       if (http.readyState == 4 && http.status == 200) {
//         console.log(http.responseText);
//         var parsed = JSON.parse(http.responseText);
//         console.log(parsed);
//         $price = parseFloat(document.getElementsByClassName("price")[0].innerText).toFixed(2) * 100;
//         if ($price !== parsed[0].price[0]){
//           document.getElementsByClassName("price")[0].innerText = Math.floor(parsed[0].price[0]/100) + "." + parsed[0].price[0] %100;
//         }
//       }
//     };
//     http.send(params);
//   }
// });


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

// $(".fa-trash").click(function (event) {
//   $(this).fadeOut(500, function () {
//     $(this).remove();
//   })
// })

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