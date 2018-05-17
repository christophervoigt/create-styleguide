
import Searchbar from '../../molecules/searchbar/searchbar';

export default function Header() {
  Searchbar('.header .searchbar', {
    mouseover: () => {
      console.log('header:', 'you hovered over my searchbar');
    },
  });

  // alternativ:
  // new Searchbar();
  // new Searchbar('header .searchbar');

  // -> Logik der Searchbar selbst wird immer ausgeführt
  // -> Callbacks ermöglichen das Erweitern der Funktionalität
}
