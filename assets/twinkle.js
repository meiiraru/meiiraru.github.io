const SPARKLE_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--sparkle_color') || "#000000";
const PARTICLE_COUNT = 50;
const MAX_LIFESPAN = 50;
const ANIMATION_SPEED_MS = 40;

let mouseX = 0, mouseY = 0;
let prevMouseX = 0, prevMouseY = 0;
let twinkle = [];

function createParticleDiv(height, width, backgroundColor = SPARKLE_COLOR, top = 0, left = 0) {
    const div = document.createElement("div");
    div.style.position        = "absolute";
    div.style.height          = `${height}px`;
    div.style.width           = `${width}px`;
    div.style.overflow        = "hidden";
    div.style.backgroundColor = backgroundColor;
    div.style.zIndex          = "10000";
    div.style.pointerEvents   = "none";
    div.style.top             = `${top}px`;
    div.style.left            = `${left}px`;
    return div;
}

function initParticles()  {
    return Array.from({ length: PARTICLE_COUNT }, () => {
        const tinyElement = createParticleDiv(3, 3);
        const starElement = createParticleDiv(5, 5, "transparent");

        const horizontalBar = createParticleDiv(1, 5, SPARKLE_COLOR, 2, 0);
        const verticalBar   = createParticleDiv(5, 1, SPARKLE_COLOR, 0, 2);
        starElement.append(horizontalBar, verticalBar);

        tinyElement.style.visibility = "hidden";
        starElement.style.visibility = "hidden";
        document.body.append(tinyElement, starElement);

        return {
            tinyElement,
            starElement,
            starLife: 0,
            starX: 0,
            starY: 0,
            tinyLife: 0,
            tinyX: 0,
            tinyY: 0
        };
    });
}

function resetParticle(particle) {
    particle.starLife = MAX_LIFESPAN;
    particle.starX = mouseX;
    particle.starY = mouseY;

    particle.starElement.style.left       = `${mouseX}px`;
    particle.starElement.style.top        = `${mouseY}px`;
    particle.starElement.style.clipPath   = "inset(0, 5px, 5px, 0)";
    particle.starElement.style.visibility = "visible";
}

function render() {
    //spawn new particle if mouse has moved
    if (mouseX !== prevMouseX || mouseY !== prevMouseY) {
        prevMouseX = mouseX;
        prevMouseY = mouseY;

        //find and reset the first available particle
        const availableParticle = twinkle.find(p => p.starLife === 0);
        if (availableParticle)
            resetParticle(availableParticle);
    }

    //update and draw particles
    for (let i = 0; i < twinkle.length; i++)
        renderParticle(twinkle[i], i);

    //schedule the next frame
    setTimeout(render, ANIMATION_SPEED_MS);
}

function renderParticle(particle, index) {
    const horizontalDrift = (index % 5 - 2) / 5;
    const gravity = 1 + Math.random() * 3;
    const star = particle.starElement;
    const tiny = particle.tinyElement;

    //handle star phase
    if (particle.starLife > 0) {
        particle.starLife--;

        //shrink the star halfway through its lifespan
        if (particle.starLife === MAX_LIFESPAN / 2)
            star.style.clipPath = "inset(1px, 4px, 4px, 1px)";

        if (particle.starLife > 0) {
            //move the star
            particle.starY += gravity;
            particle.starX += horizontalDrift;

            if (particle.starY < window.innerHeight) {
                star.style.top = `${particle.starY}px`;
                star.style.left = `${particle.starX}px`;
            } else {
                //star fell off the bottom of the screen
                particle.starLife = 0;
                star.style.visibility = "hidden";
            }
        } else {
            //star died naturally - transition to the tiny spark phase
            star.style.visibility = "hidden";

            particle.tinyLife = MAX_LIFESPAN;
            particle.tinyX = particle.starX;
            particle.tinyY = particle.starY;

            tiny.style.top        = `${particle.tinyY}px`;
            tiny.style.left       = `${particle.tinyX}px`;
            tiny.style.width      = "2px";
            tiny.style.height     = "2px";
            tiny.style.visibility = "visible";
        }
    }

    //handle tiny spark phase
    if (particle.tinyLife > 0) {
        particle.tinyLife--;

        //shrink the tiny spark halfway through its lifespan
        if (particle.tinyLife === MAX_LIFESPAN / 2) {
            tiny.style.width = "1px";
            tiny.style.height = "1px";
        }

        if (particle.tinyLife > 0) {
            //move the tiny spark
            particle.tinyY += gravity;
            particle.tinyX += horizontalDrift;

            if (particle.tinyY < window.innerHeight) {
                tiny.style.top = `${particle.tinyY}px`;
                tiny.style.left = `${particle.tinyX}px`;
            } else {
                //spark fell off the bottom of the screen
                particle.tinyLife = 0;
                tiny.style.visibility = "hidden";
            }
        } else {
            //spark died naturally
            tiny.style.visibility = "hidden";
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    twinkle = initParticles();

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    render();
});