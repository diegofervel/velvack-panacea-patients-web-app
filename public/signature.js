//import SignaturePad from "signature_pad";

document.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById('canvas');
    const signaturePad = new SignaturePad(canvas);

    document.getElementById('clear-btn').addEventListener('click', () => {
        signaturePad.clear();
    });

    document.getElementById('save-btn').addEventListener('click', () => {
        if (signaturePad.isEmpty()) {
            alert('Please provide a signature first.');
        } else {
            const dataURL = signaturePad.toDataURL('image/png');
            download(dataURL, 'signature.png');
        }
    });

    function download(dataURL, filename) {
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});