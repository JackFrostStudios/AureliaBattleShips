export class App {
  configureRouter(config, router) {
    config.title = 'Jack Frost Studios';
    config.map([
      { route: ['','home'], name: 'home', moduleId: './homePage/home', nav: true, title:'Home' },
      { route: ['/battleships','battleships'], name: 'battleships', moduleId: './battleships/gameContainer', nav: true, title:'Battleships' }
    ]);

    this.router = router;
  }
}
