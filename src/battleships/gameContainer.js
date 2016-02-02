export class home {
  welcomeHeading="Welcome to battleships!";

  configureRouter(config, router){
    config.map([
      {
        route: ['','gameMenu'],
        name: 'gameMenu',
        moduleId: '../battleships/gameMenu',
        nav: false,
        title:'Battleships Game Menu',
        parentRouter: () => {return this.router;}
      },
      {
        route: ['/battleships/newGame','newGame'],
        name: 'newGame',
        moduleId: '../battleships/game',
        nav: true,
        title:'New Game'
      }
    ]);

    this.router = router;
  }
}
