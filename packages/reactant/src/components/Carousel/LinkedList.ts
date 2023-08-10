/* eslint-disable max-classes-per-file */
import { ReactElement } from 'react';

import { CarouselLinkedListItemProps } from './CarouselLinkedList';

export class Node<T> {
  data: T;
  next: Node<T> | null = null;
  prev: Node<T> | null = null;

  constructor(data: T) {
    this.data = data;
  }
}

export class LinkedList {
  head: Node<ReactElement<CarouselLinkedListItemProps>> | null = null;

  append(data: ReactElement<CarouselLinkedListItemProps>) {
    const node = new Node(data);

    if (!this.head) {
      this.head = node;
      this.head.next = node;
      this.head.prev = node;
    } else {
      let temp = this.head;

      while (temp.next !== this.head) {
        if (temp.next) {
          temp = temp.next;
        }
      }

      const newSlide = new Node(data);

      temp.next = newSlide;
      this.head.prev = newSlide;
      newSlide.next = this.head;
      newSlide.prev = temp;
    }
  }
}
