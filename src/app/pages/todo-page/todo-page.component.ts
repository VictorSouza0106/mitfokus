import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';  
import { ICacheData, Filters, ITodoObj } from 'src/app/types/todo-types';

const LOCAL_S_DATA = "d";
const DELAY_TO_CACHE = 5 * 1000; // 5 Segundos

@Component({
  selector: 'app-todo-page',
  templateUrl: './todo-page.component.html',
  styleUrls: ['./todo-page.component.scss']
})
export class TodoPageComponent implements OnInit {

  private cachedData: ICacheData;
  
  public todoList: ITodoObj[] = [];
  public filteredTodos: ITodoObj[] = [];
  public selectedFilter: Filters = 'ALL';
  public itemLeft: number = 0;

  public form: FormGroup;


  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.KeyEventListener();
    this.getData();
    this.startCacheDataSaveTimer();
  }

  // Private

  private KeyEventListener(){
    document.addEventListener('keydown', event => {
      if (event.key === 'Enter'){
        this.addTodo();
      }
    })
  }

  private initForm(){
    this.form = this.formBuilder.group({
      inputText: null,
    });
  }

  private addTodo(){

    let inputValue = this.form.get('inputText')?.value;

    const data: ITodoObj = {
      id: new Date().valueOf(),
      complete: false,
      text: inputValue,
    }

    if(inputValue){
      this.todoList.push(data);
      this.updateStates();
      this.form.get('inputText')?.setValue(null);
    }


  }

  private updateStates(){
    this.applyFilter();
    this.itemLeft = this.todoList.filter(elem => elem.complete === false).length;
  }

  private applyFilter(){
    switch (this.selectedFilter) {
      case 'ALL':
        this.filteredTodos = this.todoList;
        break;
      case 'ACTIVE':
        this.filteredTodos = this.todoList.filter(elem => {return elem.complete === false});
        break;
      case 'COMPLETED':
        this.filteredTodos = this.todoList.filter(elem => {return elem.complete === true});
        break;
    }
  }

  // Requisiçoes

  private getData(){

    // TODO - Add API CALL - GET

    const localStorage = window.localStorage.getItem(LOCAL_S_DATA);
    this.cachedData = JSON.parse(localStorage as string);   

    if(this.cachedData){
      this.todoList = this.cachedData?.todos;
      this.selectedFilter = this.cachedData?.selectedFilter;
    }

    this.updateStates();

  }

  private populateCacheData(){
    this.cachedData = {
      timestamp: new Date().valueOf(),
      todos: this.todoList,
      selectedFilter: this.selectedFilter
    }
  }

  private startCacheDataSaveTimer(){
    setTimeout(() => {
      // TODO - Add API CALL - PUT    
      this.populateCacheData();
      window.localStorage.setItem(LOCAL_S_DATA, JSON.stringify(this.cachedData));

      this.startCacheDataSaveTimer();
    }, DELAY_TO_CACHE);
  }

  // Publics

  public checkChange(index: number){
    this.updateStates()
    
  }

  public checkAll(){

    if(this.todoList.length === 0)
      return;

    const hasChecked = this.hasCheckedTodo();
    
    this.todoList.forEach(elem => {
      elem.complete = hasChecked ? false : true;
    });

    this.updateStates();
  }

  public removeItem(todo: ITodoObj){
    const index = this.todoList.findIndex(elem => {return elem.id === todo.id});

    this.todoList.splice(index, 1);
    this.updateStates();

  }

  public removeChecked(){
    this.todoList = this.todoList.filter(elem => {
      return elem.complete === false; 
    });

    this.updateStates();
  }

  public setFilter(filter: Filters){
    this.selectedFilter = filter;
    this.applyFilter();
  }

  // Validators

  public hasCheckedTodo(){
    return !!this.todoList.filter(elem => {return elem.complete === true}).length;
  }

  public hasTodoItem(){
    return this.todoList.length > 0;
  }

  public showFilters(){
    return this.hasTodoItem() || this.itemLeft || this.selectedFilter !== 'ALL'
  }
}
