var request;

$(".submission-form").submit(function(event) {
  event.preventDefault();

  if (request) {
    request.abort();
  }

  var $form = $(this);

  var $inputs = $form.find("input, select, button, textarea");

  var permalink = document.getElementById('game_title').value
    .replace(/[.,\/#!$%\^&\*;:{}=\+`~()\[\]'"@|<>?]/g,"")
    .replace(/\s{2,}/g," ")
    .replace(/ /g, '-').toLowerCase()
    + `-${Date.now()}`;

  var published_on = new Date();
  published_on.setDate(published_on.getDate() - 1);

  var fields = $form.serializeArray().reduce(( acc, formInput ) => {
    var title = formInput.name.split('_').map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
    var value = formInput.value;

    var fieldObject = {
      num_options: 0,
      options: [],
      title,
      variable_name: formInput.name,
      type: 'text',
      value,
    };

    switch(true) {
      case formInput.name.includes('url'):
        fieldObject.title = fieldObject.title.replace('Url', 'URL');
        acc.push(fieldObject);
        break;
      case formInput.name === 'game_description':
        fieldObject.type = 'text area';
        acc.push(fieldObject);
        break;
      default:
        acc.push(fieldObject);
    }

    return acc;
  }, []);

  // Let's disable the inputs for the duration of the Ajax request.
  // Note: we disable elements AFTER the form data has been serialized.
  // Disabled form elements will not be serialized.
  $inputs.prop("disabled", true);

  var requiredFields = document.querySelectorAll('.form-required');
  var invalidInputs = document.querySelectorAll('.is-invalid-input');
  var invalidFields = [];

  // Checks if values are blank
  requiredFields.forEach(function(field) {
    if (field.value.trim().length === 0) {
      invalidFields.push(field);
    }
  });

  var data = {
    aerostat_collection_id:211,
    fields,
    tags:[],
    categories:[],
    permalink,
    published_on
  };

  if (invalidFields.length === 0 && invalidInputs.length === 0) {

    $('#submit').addClass('clicked');

    request = $.ajax({
      url: "/api/aerostats",
        type: "post",
        data: JSON.stringify(data),
        contentType: 'application/json'
    });

    // Callback handler that will be called on success
    request.done(function (response, textStatus, jqXHR){
      $('.submission-form')[0].reset();
      $('.notification').css('display', 'block');
      setTimeout(() => {
        $('.notification').css('display', 'none');
        $('#submit').removeClass('clicked');
      }, 3000);
    });

    // Callback handler that will be called on failure
    request.fail(function (jqXHR, textStatus, errorThrown){
      // console.error(
      //   "The following error occurred: "+
      //   textStatus, errorThrown
      // );
    });

    // Callback handler that will be called regardless
    // if the request failed or succeeded
    request.always(function () {
      // Reenable the inputs
      $inputs.prop("disabled", false);
    });
  } else {
    $inputs.prop('disabled', false);
  }
});
