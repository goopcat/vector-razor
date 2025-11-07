function handleKeyDown(e) {
    if (!playing || !ship) return;

    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        controls.forward = true;
    } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        controls.left = true;
    } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        controls.right = true;
    } else if (e.key === ' ') {
        if (controls.shoot === false) {
            controls.shoot = true;
            if (ship) ship.shoot();
        }
        e.preventDefault();
    }
}

function handleKeyUp(e) {
    if (!playing || !ship) return;

    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        controls.forward = false;
    } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        controls.left = false;
    } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        controls.right = false;
    } else if (e.key === ' ') {
        controls.shoot = false;
    }
}