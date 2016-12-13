export default class EventTarget {
    prevent = false;

    preventDefault() {
        this.prevent = true;
    }

    isPreventDefault() {
        return this.prevent;
    }
}
