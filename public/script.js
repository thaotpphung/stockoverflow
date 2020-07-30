// Mark current page
$(document).ready(function () {
  $(function () {
    $("a.nav-item.nav-link").each(function () {
      var $nav = $(".navbar");
      if (window.location.href.includes($(this).prop("href"))) {
        $nav.find("a").removeClass("activeLink");
        $(this).addClass("activeLink");
      }
    });
  });
});

/* ----------------------------TrackedStocks---------------------------- */
// Show stock info
$(".table tbody").delegate("tr", "click", function (event) {
  $(this).find(".fa-info").trigger("click");
  event.stopPropagation();
});
$(".fa-info").click (function (event) {
  event.stopPropagation();
});

// Delete a stock from table
$(".fa-trash").click (function (event) {
  $(this).closest("tr").fadeOut(500, function () {
    $(this).addClass("d-none");
    $(this).find('button').trigger("click");
  });
  event.stopPropagation();
});

/* ----------------------------Transactions---------------------------- */
// Add to Tracked Stocks table
$(".fa-eye").click (function (event) {
  $(this).closest("tr").find('button').trigger("click");
  event.stopPropagation();
});

// toggle the transaction form
$(".show-form").click(function(event) {
  $(this).closest(".card-container").find("form").fadeToggle("fast", "linear");
})

/* -----------------------search----------------------- */
var $searchResult = $("#searchResult");
var $searchKey = $("#searchKey");

// send request whenever user enter a valid string
$("#searchKey").keyup( async function (event) {
  $searchResult.removeClass("d-none");
  if (event.which == 8 || (event.which >= 65 && event.which <= 90)) {
    // make search request when user hit appropriate keys
    let searchVal = $(this).val().toUpperCase();
    searchQuery(searchVal);
  } else if (event.which == 13) {
    // when user hit enter key in 
    if (!($searchResult.html().includes("notfound-mes"))) {
      // if in the transaction stock page
      if ($("#tickSymbolDiv").html()) {
        let searchVal = $("#searchKey").val();
        // let url = "http://localhost:8000/getStock";
        let url = "https://shrouded-shelf-22294.herokuapp.com/getStock";
        
        let foundStock = await makeHttpRequest(url, searchVal);
        // after search for stock, 
        if (foundStock === "not found") {
          $("#stock-symbol").val(searchVal.toUpperCase());
          $("#addStockForm").submit();
        } else {
          $(".transaction-symbol").val(searchVal.toUpperCase());
          $(".transaction-name").val(foundStock.name);
          $(".transaction-stockid").val(foundStock._id);
          $(".transaction-price").val(Math.floor(foundStock.history[0].open/100) + "." + foundStock.history[0].open%100);
          var today = new Date().toISOString().split('T')[0];
          $(".transaction-time").val(today);
          $(".fa-times").click();
        }
      } else { // else in the add page, submit the form
        $("#searchStockForm").submit();
      }
    } 
  }
});

// send request to server API for search query and return result
async function searchQuery(searchTerm) {
  let url = "https://shrouded-shelf-22294.herokuapp.com/search";
  // let url = "http://localhost:8000/search";
  let found = await makeHttpRequest(url, searchTerm)
  if (found === "not found") {
    $searchResult.html('<div class="notfound-mes">Can\'t find stock, search another term </div>');
    $searchResult.css({
      "cursor": "wait",
      "pointer-events": "none"
    });
  } else {
    $searchResult.css({
      "cursor": "pointer",
      "pointer-events": "auto"
    });
    $searchResult.html("");
    displaySearchResult(found);
  } 
}

async function makeHttpRequest(url, searchVal) {
  return new Promise ((resolve, reject) => {
    var params = "symbol=" + searchVal;
    var http = new XMLHttpRequest();
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function () {
      if (http.readyState == 4 && http.status == 200) {
        var found = JSON.parse(http.responseText).foundStock;
        if (found == null) {
          resolve("not found");
        } else {
          resolve(found);
        };
      }
    };
    http.send(params);
  })
}

// prevent submit form by hit ENTER key
$("#searchStockForm").keydown(function (event) {
  if (event.which == 13) {
    event.preventDefault(); 
    return false;
  }
});

// listen for click on div to fill the search box with that value
$searchResult.delegate("div", "click", function (event) {  
  var found = $(this).text();
  $searchKey.val(found.split("-")[0].trim());
  $(this).parent().addClass("d-none");
});

// display search result
function displaySearchResult(found) {
  let htmlString = "";
  for (i = 0; i < found.length; i++) {
    if (i == 10) {
      break;
    }
    htmlString += '<div class="search-item">' + found[i].symbol + " - " + found[i].name + " </div>";
  }
  $searchResult.html(htmlString);
}

/* -----------------------Pop up search bar----------------------- */
function togglePopup(){
  $("#popup-search-bar").toggleClass("active");
}

/* -----------------------User----------------------- */
$(".fa-edit").click(function (event) {
  fadeForm($(this).closest(".col-12").find(".editForm"));
});

function fadeForm($edit) {
  if ($edit.is(':visible')) {
    $edit.fadeOut(300, () => $edit.hide());
  } else {
    $edit.fadeIn(300, () => $edit.show());
  }
}

