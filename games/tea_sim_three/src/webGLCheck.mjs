export function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

export function getWebGLErrorMessage() {
    const element = document.createElement('div');
    element.id = 'webgl-error-message';
    element.style.cssText = `
        background: #f00;
        color: #fff;
        padding: 1.5em;
        width: 400px;
        margin: 5em auto;
        text-align: center;
    `;
    element.innerHTML = window.WebGLRenderingContext ? 
        'Your graphics card does not seem to support WebGL.' :
        'Your browser does not seem to support WebGL.';
    return element;
} 