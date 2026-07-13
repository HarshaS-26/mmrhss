async function compressImage(file, maxWidth = 1600, quality = 0.75) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith("image/")) {
            reject("Invalid image file");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            const img = new Image();

            img.onload = function () {
                const canvas = document.createElement("canvas");

                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    function (blob) {
                        if (!blob) {
                            reject("Image compression failed");
                            return;
                        }

                        const compressedFile = new File(
                            [blob],
                            `${Date.now()}.jpg`,
                            { type: "image/jpeg" }
                        );

                        resolve(compressedFile);
                    },
                    "image/jpeg",
                    quality
                );
            };

            img.onerror = function () {
                reject("Could not load image");
            };

            img.src = event.target.result;
        };

        reader.onerror = function () {
            reject("Could not read file");
        };

        reader.readAsDataURL(file);
    });
}

function getStoragePathFromUrl(url, bucketName) {
    if (!url) return null;

    const marker = `/storage/v1/object/public/${bucketName}/`;
    const index = url.indexOf(marker);

    if (index === -1) return null;

    return url.substring(index + marker.length);
}

async function deleteStorageFile(bucketName, fileUrl) {
    const filePath = getStoragePathFromUrl(fileUrl, bucketName);

    if (!filePath) return;

    await supabaseClient.storage
        .from(bucketName)
        .remove([filePath]);
}

async function uploadCompressedImage(bucketName, folderName, imageFile) {
    const compressedImage = await compressImage(imageFile);

    const fileName = `${Date.now()}.jpg`;
    const filePath = `${folderName}/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
        .from(bucketName)
        .upload(filePath, compressedImage);

    if (uploadError) {
        throw uploadError;
    }

    const { data: publicUrlData } = supabaseClient.storage
        .from(bucketName)
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}