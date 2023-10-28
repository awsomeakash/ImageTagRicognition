$(() => {
  let labelsElement = $('#labels');
  let labelListElement = $('#label-list');
  let errorElement = $('#error');
  let submitButton = $('#classify');
  let resetButton = $('#reset');
  let inputFileElement = $('#file');
  let imagePreviewElement = $('#preview');
  let canSubmit = false;

  inputFileElement.on('change', () => {
    let files = inputFileElement.prop('files');

    if (!!files && files.length > 0) {
      // limit upload to 5 MB
      if (files[0].size > 5 * 1024 * 1024) {
        alert('Max allowed filesize is 5 MB');

        inputFileElement.val(null);

        return;
      }

      previewImage(files[0], imageUrl => {
        imagePreviewElement.css('background-image', 'url(' + imageUrl + ')');
        imagePreviewElement.removeClass('hidden');
      });

      // we are safe to enable submit
      enableSubmitButton(); 
    }
  });

  function previewImage(file, callback) {
    var reader = new FileReader();

    reader.addEventListener("load", function() {
      if (!!callback) {
        callback(reader.result);
      }
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  function submitForm() {
    if (!canSubmit) {
      return;
    }

    try {
      let url = '/vision/classify';
      submittingForm = true;
      let files = inputFileElement.prop('files');
      let formData = new FormData();
  
      formData.append('file', files[0]);

      submitButton.text('Classifying...');
  
      // prevent further submits
      disableSubmitButton();  
  
      // submit form
      $.ajax(url, {
        method: 'POST',
        data: formData,
        cache: false,
        // necessary for file upload to work
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
      }).done(data => {
        console.log('Data: ' + JSON.stringify(data));
  
        try {
          if (!data || !data.labels) {
            throw 'Unable to extract labels';
          }
            
          let labels = data.labels;
  
          // clear list
          labelListElement.empty();

          labels.forEach(label => {
            let labelItem = $('<div class=\'list-item\' />');
            
            labelItem.text(label);
            
            labelListElement.append(labelItem);
          });

          labelsElement.removeClass('hidden');
          errorElement.addClass('hidden');
        } catch (error) {
          // this probably means that response is not what we expected
          setError('Unrecoverable Error: ' + error);
        }
      }).fail(jqXHR => {
        console.error('Error: ' + jqXHR.responseText);
  
        try {
          let errorThrown = JSON.parse(jqXHR.responseText);
  
          if (!errorThrown.error) {
            throw 'Error message not found';
          }

          setError(errorThrown.error);
        } catch (error) {
          // this probably means that response is not what we expected
          setError('Unrecoverable Error: ' + error);
        }
      }).always(() => { // make sure to enable submit button after we get any result
        enableSubmitButton();
      });
    } catch (error) { // make sure to enable submit button on any errors
      console.error('Error submitting form: ' + error);
      
      setError('Error submitting form: ' + error);

      enableSubmitButton();
    }
  }

  function setError(error) {
    errorElement.text(error);
  
    labelsElement.addClass('hidden');
    errorElement.removeClass('hidden');
  }

  function resetForm() {
    // reset file
    inputFileElement.val(null);

    // reset image preview
    imagePreviewElement.css('background-image', '');
    imagePreviewElement.addClass('hidden');

    // hide result & error section
    labelListElement.empty();
    labelsElement.addClass('hidden');
    errorElement.addClass('hidden');

    disableSubmitButton();
  }

  function enableSubmitButton() {
    canSubmit = true;

    submitButton.text('Classify').removeClass('disabled');
  }

  function disableSubmitButton() {
    submitButton.addClass('disabled');
  }

  submitButton.on('click', submitForm);

  resetButton.on('click', resetForm);

  // clear form on ready
  resetForm();
});
