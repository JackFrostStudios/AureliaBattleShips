export class gameMenu {
  router = null;
  newGame() {
    this.parentRouter.navigate("newGame");
  }

  activate(params, routeconfig){
    this.parentRouter = routeconfig.parentRouter();
  }
}
