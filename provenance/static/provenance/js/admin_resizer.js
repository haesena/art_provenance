(function () {
    'use strict';

    const MAX_DIMENSION = 2000; // max width or height in pixels
    const QUALITY = 0.8;

    function resizeImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
                        resolve(file); // No resize needed
                        return;
                    }

                    if (width > height) {
                        if (width > MAX_DIMENSION) {
                            height *= MAX_DIMENSION / width;
                            width = MAX_DIMENSION;
                        }
                    } else {
                        if (height > MAX_DIMENSION) {
                            width *= MAX_DIMENSION / height;
                            height = MAX_DIMENSION;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(blob => {
                        if (!blob) {
                            reject(new Error('Canvas toBlob failed'));
                            return;
                        }
                        const resizedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });
                        resolve(resizedFile);
                    }, file.type, QUALITY);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }

    function handleFileChange(event) {
        const input = event.target;
        const files = input.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) return;

        // Skip if it's already a resized blob we just added
        if (input._isResizing) return;

        console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

        resizeImage(file).then(resizedFile => {
            if (resizedFile === file) {
                console.log('No resizing needed.');
                return;
            }

            console.log(`Resized file size: ${(resizedFile.size / 1024 / 1024).toFixed(2)} MB`);

            // Use DataTransfer to replace the file in the input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(resizedFile);

            input._isResizing = true;
            input.files = dataTransfer.files;
            input._isResizing = false;

            // Trigger change event for any other listeners
            const changeEvent = new Event('change', { bubbles: true });
            input.dispatchEvent(changeEvent);
        }).catch(err => {
            console.error('Error resizing image:', err);
        });
    }

    document.addEventListener('change', function (event) {
        if (event.target && event.target.type === 'file') {
            handleFileChange(event);
        }
    }, true);

    console.log('Django Admin Image Resizer initialized.');
})();
