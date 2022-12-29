import { drawHighlight, selectedItemsStore, selectionBoundsStore } from "$lib/stores/layerStateStore";

type ScaleType = 'height' | 'width' | 'both';

let selectedItems = new Set<paper.Item>();
selectedItemsStore.subscribe((value) => {
	selectedItems = value;
});

let selectionBounds: paper.Rectangle | undefined;
selectionBoundsStore.subscribe((value) => {
	selectionBounds = value;
});

export class Scaler {
	_scaleAbout: paper.Point | undefined;
	_scaleStartPoint: paper.Point | undefined;
	_originalScaleBounds: paper.Rectangle | undefined;
	_scaleType: ScaleType | undefined;
    _prevScale: { x: number; y: number };

	constructor(props: {
		scaleAbout?: paper.Point;
		scaleStartPoint?: paper.Point;
		scaleType?: ScaleType;
	}) {
		this._scaleAbout = props.scaleAbout;
		this._scaleStartPoint = props.scaleStartPoint;
		this._originalScaleBounds = selectionBounds;
		this._scaleType = props.scaleType;
		this._prevScale = { x: 1, y: 1 };
	}

	_getScaleAboutPoint(type: string, bounds: paper.Rectangle): paper.Point | undefined {
		switch (type) {
			case 'topLeft':
				return bounds.bottomRight;
			case 'topRight':
				return bounds.bottomLeft;
			case 'bottomLeft':
				return bounds.topRight;
			case 'bottomRight':
				return bounds.topLeft;
			case 'top':
				return bounds.bottomCenter;
			case 'bottom':
				return bounds.topCenter;
			case 'left':
				return bounds.rightCenter;
			case 'right':
				return bounds.leftCenter;
			default:
				return undefined;
		}
	}

	setScaleAboutPoint(type: string, bounds: paper.Rectangle): void {
		this._scaleAbout = this._getScaleAboutPoint(type, bounds);
	}

    scaleSelection(point: paper.Point): void {
        if (this._scaleAbout && this._scaleStartPoint && this._originalScaleBounds && this._scaleType && selectionBounds) {
            let { x, y } = point.subtract(this._scaleStartPoint);
            const { width: origWidth, height: origHeight } = this._originalScaleBounds;
            const { width: curWidth, height: curHeight } = selectionBounds;
    
            let width = origWidth;
            let height = origHeight;
        
            // determine the correct scale factor based scale reference pt
            if (this._scaleAbout.x === this._originalScaleBounds.rightCenter.x) {
              x = -x;
            }
    
            if (this._scaleAbout.y === this._originalScaleBounds.bottomCenter.y) {
              y = -y;
            }
    
            if (this._scaleType === 'width') {
              width = origWidth + x;
            } else if (this._scaleType === 'height') {
              height = origHeight + y;
            } else if (this._scaleType === 'both') {
              width = origWidth + x;
              height = origHeight + y;
            }
    
            if (width === 0) {
                width = 1;
            }
            if (height === 0) {
                height = 1;
            }
        
            const scale = {
              x: width / curWidth,
              y: height / curHeight,
            };
    
            const adjustedScale = {
                x: scale.x,
                y: scale.y,
            }
            
            selectedItems.forEach((item) => {
                item.scale(Math.abs(adjustedScale.x), Math.abs(adjustedScale.y), this._scaleAbout);
    
                if (Math.sign(scale.x) !== Math.sign(this._prevScale.x)) {
                    item.scale(-1, 1, this._scaleAbout);
                }
                if (Math.sign(scale.y) !== Math.sign(this._prevScale.y)) {
                    item.scale(1, -1, this._scaleAbout);
                }
            });
            
            this._prevScale = scale;
            drawHighlight();
        }
    }
}
