async function newFormHandler(event) {
    event.preventDefault();

    const title = document.querySelector('input[name="post-title"]').value;
    const post_content = document.querySelector('textarea[name="post-content"]').value.trim();
    const file = document.querySelector('#upload').files[0];

    console.log(file)

    // const formData = new FormData();
    // formData.append('file', file);
    // const formData = document.getElementById('form_upload')

    const formData = new FormData(document.getElementById('upload_form'))
    for (var [key, value] of formData.entries()) { 
        console.log(key, value);
      }

    const response = await fetch(`/api/posts/upload`, {
        method: 'POST',
        data:
        //  {
            // title, 
            // post_content,
            formData,
        // }
    //   headers: {
    //         'Content-Type': 'multipart/form-data'
    //      }
    });

    if (response.ok) {
        // document.location.replace('/dashboard');
    } else {
        alert(response.statusText);
    }
}

document.querySelector('.new-post-form').addEventListener('submit', newFormHandler);