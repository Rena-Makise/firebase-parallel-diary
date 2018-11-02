const vapidPublicKey = "{{data.vapidPublicKey}}";
const convertedVPkey = urlB64ToUint8Array(vapidPublicKey);
function urlB64ToUint8Array(base64String)
{
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

$(document).ready( function () {
  if (navigator.serviceWorker.controller) {
    console.log('[PWA Builder] active service worker found, no need to register')
  } else if ('serviceWorker' in navigator && 'PushManager' in window ) {
    // Register serviceWorker
    navigator.serviceWorker.register('/pwabuilder-sw.js').then(function(swReg) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', swReg.scope);
      // Add Button Listener
      $("#testbutton").on("updateBtn", function (e, isSub) {
        if (Notification.permission === 'denied') 
          return $(this).html("Denied");
        if( isSub )
          $(this).attr("data-next-action","unsub").html("unsubscribe!");
        else
          $(this).attr("data-next-action","sub").html("subscribe!");
        $(this).removeAttr("disabled");
      }).on("click", function (e) {
        //Disabled Button until user response..
        $(this).attr("disabled", true);
        if( $(this).attr("data-next-action") == "sub" )
        { // Subscribing...
          swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVPkey
          })
          .then(function(subscription) {
             $.ajax({
                method : 'POST',
                url : '/push-send',
                dataType : 'json',
                data : {
                  subscription: JSON.stringify(subscription),
                  data: JSON.stringify({
                    title : 'TITLE',
                    body : 'Push send test..',
                    params : {
                      url : '/'
                    }
                  })	
              }
            }).done( function (res){
              console.log(res);
              $("#testbutton").trigger("updateBtn",[true]);
            }).fail( function (err) {
              console.log(err);
            });							
          })
          .catch(function(err) {
            console.log('Failed to subscribe the user: ', err);
            $("#testbutton").trigger("updateBtn",[false]);
          });	
        }
        else
        { // Unsubscribing..
          swReg.pushManager.getSubscription().then(function(subscription) {
            if (subscription) 
              return subscription.unsubscribe();
          })
          .catch(function(error) {
            console.log('Error unsubscribing', error);
            $("#testbutton").trigger("updateBtn",[true]);
          })
          .then(function() {
            console.log('User is unsubscribed.');
            $("#testbutton").trigger("updateBtn",[false]);
          });
        }
      });
      // Check Subscribe > and Update Button
      swReg.pushManager.getSubscription().then( function(subscription) {
        isSubscribed = !(subscription === null);
        //Update Button
        $("#testbutton").trigger("updateBtn", [isSubscribed]);
        if (isSubscribed)
          console.log('User is subscribed.');
        else
          console.log('User is NOT subscribed.');
      });
    }).catch(function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  }
});