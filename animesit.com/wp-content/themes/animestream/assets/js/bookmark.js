var BOOKMARK = {};
BOOKMARK.max = max_bookmark;
BOOKMARK.checkLocalStorage = function () {
  return typeof Storage === "function";
};
BOOKMARK.storeLocalStorage = function (name, data) {
  if (false == BOOKMARK.checkLocalStorage()) return false;
  return localStorage.setItem(name, JSON.stringify(data));
};
BOOKMARK.getLocalStorage = function (name) {
  if (typeof name === undefined) return false;
  if (false == BOOKMARK.checkLocalStorage()) return false;
  if (name in localStorage === false) return false;
  return JSON.parse(localStorage[name]);
};
BOOKMARK.getStored = function () {
  var bookmarks = BOOKMARK.getLocalStorage("bookmark");
  if (false == bookmarks) return [];
  if (typeof bookmarks !== typeof []) return [];
  else return bookmarks;
};
BOOKMARK.find = function (id) {
  if (false == BOOKMARK.checkLocalStorage()) {
    return false;
  }
  var stored = BOOKMARK.getStored();
  var index = stored.indexOf(id);
  return index;
};
BOOKMARK.remove = function (id) {
  if (false == BOOKMARK.checkLocalStorage()) {
    return false;
  }
  var stored = BOOKMARK.getStored();
  var index = stored.indexOf(id);
  if (index === -1) return true;
  stored.splice(index, 1);
  BOOKMARK.storeLocalStorage("bookmark", stored);
  jQuery.post(ajaxurl, { action: "bookmark_remove", id: id });
  return true;
};
BOOKMARK.push = function (id) {
  if (false == BOOKMARK.checkLocalStorage()) {
    alert(
      "Maaf, browser anda tidak mendukung fitur ini.\nGunakan browser google chrome / mozilla"
    );
    return false;
  }
  if (isNaN(id)) return false;
  var stored = BOOKMARK.getStored();
  if (stored.length >= BOOKMARK.max) {
    stored = stored.slice(-BOOKMARK.max);
    BOOKMARK.storeLocalStorage("bookmark", stored);
    alert(
      "Maaf, anda mencapai batas bookmark, \nsilahkan hapus Sika ANIME lain dari bookmark"
    );
    return false;
  }
  if (stored.indexOf(id) !== -1) {
    return true;
  }
  stored.unshift(id);
  BOOKMARK.storeLocalStorage("bookmark", stored);
  jQuery.post(ajaxurl, { action: "bookmark_push", id: id });
  return true;
};
BOOKMARK.check = function () {
  var BMEl = jQuery("div.bookmark[data-id]");
  if (BMEl.length < 1) return false;
  var id = BMEl.get(0).getAttribute("data-id");
  if (isNaN(id)) return false;
  var bindex = BOOKMARK.find(id);
  if (!isNaN(bindex) && bindex !== -1) {
    BMEl.html(
      '<i class="fas fa-bookmark" aria-hidden="true"></i> تم الحفظ كمفضل'
    );
    BMEl.addClass("marked");
    return true;
  } else {
    BMEl.html('<i class="far fa-bookmark" aria-hidden="true"></i> حفظ كمفضل');
    BMEl.removeClass("marked");
    return false;
  }
};
BOOKMARK.listener = function () {
  var BMEl = jQuery("div.bookmark[data-id]");
  if (BMEl.length < 1) return false;
  BMEl.on("click", function () {
    var id = this.getAttribute("data-id");
    if (isNaN(id)) return false;
    if (BOOKMARK.find(id) === -1) {
      BOOKMARK.push(id);
    } else {
      BOOKMARK.remove(id);
    }
    BOOKMARK.check();
    return true;
  });
};

// your-child-theme/js/Sika ANIME-lists.js
jQuery(document).ready(function ($) {
  // Function to update button text/class based on list status
  function updateButtonStatus(button, action_performed) {
    if (action_performed === "add") {
      button
        .removeClass("add-to-list")
        .addClass("remove-from-list")
        .text("Remove from " + button.data("list-name"));
    } else {
      // action_performed === 'remove'
      button
        .removeClass("remove-from-list")
        .addClass("add-to-list")
        .text("Add to " + button.data("list-name"));
    }
  }

  // Handle clicks on the list buttons on single Sika ANIME pages
  $(".my-Sika ANIME-list-btn").on("click", function (e) {
    e.preventDefault();

    var $this = $(this);
    var Sika ANIME_id = $this.data("Sika ANIME-id");
    var list_type = $this.data("list-type"); // e.g., 'favorite', 'watching_now'
    var action_type = $this.hasClass("add-to-list") ? "add" : "remove"; // Determine action

    $this.prop("disabled", true).text("Processing..."); // Disable button during AJAX

    $.ajax({
      url: mySika ANIMELists.ajax_url,
      type: "POST",
      data: {
        action: "my_Sika ANIME_lists",
        nonce: mySika ANIMELists.nonce,
        Sika ANIME_id: Sika ANIME_id,
        list_type: list_type,
        action_type: action_type,
      },
      success: function (response) {
        if (response.success) {
          console.log(response.data.message);
          // Update button status based on the action performed
          updateButtonStatus($this, response.data.action_performed);
        } else {
          console.error("Error:", response.data.message);
          alert(response.data.message);
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX Error:", status, error);
        alert("An error occurred. Please try again.");
      },
      complete: function () {
        $this.prop("disabled", false); // Re-enable button
      },
    });
  });

  // Handle clicks on the "Remove from List" button on the user profile page
  $(document).on("click", ".remove-from-profile-list", function (e) {
    e.preventDefault();

    var $this = $(this);
    var Sika ANIME_id = $this.data("Sika ANIME-id");
    var list_type = $this.data("list-type");
    var $card = $this.closest(".Sika ANIME-card-container"); // Find the parent Sika ANIME card element
    var $tabPane = $this.closest(".Sika ANIME-list-tab-pane"); // Find the parent tab pane

    $this.prop("disabled", true).text("Removing...");

    $.ajax({
      url: mySika ANIMELists.ajax_url,
      type: "POST",
      data: {
        action: "my_Sika ANIME_lists",
        nonce: mySika ANIMELists.nonce,
        Sika ANIME_id: Sika ANIME_id,
        list_type: list_type,
        action_type: "remove", // Always 'remove' for profile page buttons
      },
      success: function (response) {
        if (response.success) {
          console.log(response.data.message);
          // Remove the Sika ANIME card from the DOM
          $card.fadeOut(300, function () {
            $(this).remove();
            // Check if the list is now empty and display a message
            if ($tabPane.find(".Sika ANIME-card-container").length === 0) {
              $tabPane.append(
                '<div class="text-center Sika ANIME-list-empty-message" style="margin-top:120px;color: #999;">لم تضف أي انمي إلى هذه القائمة حتى الآن</div>'
              );
            }
          });

          // If a button for this Sika ANIME exists on a single page, update its status
          // This is for real-time consistency if the user has multiple tabs open
          $(
            '.my-Sika ANIME-list-btn[data-Sika ANIME-id="' +
              Sika ANIME_id +
              '"][data-list-type="' +
              list_type +
              '"]'
          ).each(function () {
            updateButtonStatus($(this), "remove");
          });
        } else {
          console.error("Error:", response.data.message);
          alert(response.data.message);
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX Error:", status, error);
        alert("An error occurred. Please try again.");
      },
      complete: function () {
        // If the element is removed, no need to re-enable the button.
      },
    });
  });
});
