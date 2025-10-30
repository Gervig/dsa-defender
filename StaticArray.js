  /**
 * A static array class
 * 
 * This class is a wrapper around a native JavaScript Array object, that
 * provides a fixed length array. The length is set at construction time
 * and cannot be changed. The array is zero-based, and the indexes are
 * integers from 0 to length-1.
 * 
 * The class provides a get and set method to access the elements of the
 * array, and an at method to access the elements of the array. The at
 * method will throw a RangeError if the index is out of bounds.
 * 
 * The class also provides an iterator, so that the array can be used in
 * a for...of loop.
 * 
 * This is what JavaScript has always needed, an array that cannot be
 * resized, and that throws an error if you try to access anything out
 * of bounds.
 * Use it like you would use a normal array - without all the fancy
 * push, pop, shift, unshift, splice, etc. methods.
 * 
 * author:  Peter Lind
 */
export default class StaticArray {
  #_arr;
  #_length;
  constructor(length) {
    this.#_length = length;
    this.#_arr = new Array(length);

    // Define a Proxy handler to trap [n] indexes and .length
    const handler = {
      get: function(target, prop, receiver) {
        if(typeof prop !== "symbol") {
          // check if prop is length
          if(prop === "length") {
            return target.length;
          }

          // check if prop is a number
          // if it is, return the value at that index
          if(typeof prop === "number" || Number.isInteger(Number(prop))) {
            return target.get(Number(prop));
          }
        }

        return Reflect.get(target,prop,receiver);
      },
      set: function(target, prop, value, receiver) {
        if(typeof prop !== "symbol") {
          // check if prop is a number
          // if it is, set the value at that index
          if(typeof prop === "number" || Number.isInteger(Number(prop))) {
            target.set(Number(prop),value);
            return true; // not sure if this should return true or undefined
          }
        }

        return Reflect.set(target,prop,value,receiver);
      }
    }

    // bind this in the methods to this instance, rather than the Proxy
    this.set = this.set.bind(this);
    this.at = this.at.bind(this);
    this[Symbol.iterator] = this[Symbol.iterator].bind(this);

    return new Proxy(this,handler);
  }

  get length() {
    return this.#_length;
  } 

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        if(index < this.#_length) {
          return {value: this.#_arr[index++], done: false};
        } else {
          return {done: true};
        }
      }
    }
  }

  #_checkindex(index) {
    if(index < 0 || index >= this.#_length) {
      throw new RangeError("Index must be between 0 and length: " + this.#_length);
    }
  }

  at(index) {
    this.#_checkindex(index);
    return this.#_arr[index];
  }

  get(index) {
    return this.at(index);
  }

  set(index,value) {
    this.#_checkindex(index);
    this.#_arr[index] = value;
  }
}