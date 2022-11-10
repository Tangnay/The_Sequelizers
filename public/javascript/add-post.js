async function newFormHandler(event) {
    event.preventDefault();

    const title = document.querySelector('input[name="post-title"]').value;
    const post_content = document.querySelector('textarea[name="post-content"]').value.trim();
    const file_upload = document.querySelector('#upload').files[0];

    console.log(file_upload)

    const response = await fetch(`/api/posts/upload`, {
        method: 'POST',
        body: 
            // JSON.stringify({
            // title,
            // post_content,
            file_upload
        ,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        // document.location.replace('/dashboard');
    } else {
        alert(response.statusText);
    }
}

document.querySelector('.new-post-form').addEventListener('submit', newFormHandler);