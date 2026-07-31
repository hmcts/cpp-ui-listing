if (!DataTransfer.prototype.setDragImage) {
  DataTransfer.prototype.setDragImage = function(element, offsetX, offsetY, event, container) {

    var dragElement = element.cloneNode( true );
    var dragContainerEl;
    var dragContainerClass = 'ie-drag-container';

    function initialise() {
      dragContainerEl = document.createElement( 'div' );
      dragContainerEl.style.position = 'fixed';
      dragContainerEl.style.pointerEvents = 'none';
      dragContainerEl.style.zIndex = '98';
      dragContainerEl.style.width = element.clientWidth + 'px';
      dragContainerEl.style.height = element.clientHeight + 'px';
      dragContainerEl.classList.add( dragContainerClass );
      dragContainerEl.appendChild( dragElement );
      container.appendChild(dragContainerEl);
      updatePositions( event );
      document.addEventListener( 'drag', updatePositions );
      document.addEventListener( 'dragend', destroy );
    }

    function destroy() {
      dragContainerEl.classList.remove( dragContainerClass );
      container.removeChild( dragContainerEl );
      document.removeEventListener( 'drag', updatePositions );
      document.removeEventListener( 'dragend', destroy );
    }

    function updatePositions( event ) {
      dragContainerEl.style.top = (event.clientY - offsetY) + 'px';
      dragContainerEl.style.left = (event.clientX - offsetX) + 'px';
    }

    initialise();

  };
}
