import { OnInit, AfterContentChecked, Injector, Directive } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";   //id que é passado na rota para editar o recurso

import { BaseResourceModel } from "../../models/base-resource.model"
import { BaseResourceService } from "../../services/base-resource.service"

import { switchMap } from "rxjs/operators"; //manipular a rota 

import toastr from "toastr";                //exibe os alertas traga tudo do toastr
import { Category } from 'src/app/pages/categories/shared/category.model';


@Directive()
export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked{
  
  currentAction: string;                    //editando ou criando novo recurso new/edit
  resourceForm: FormGroup;                  //angular basico para formar grupo nos formularios
  pageTitle: string;                        //Qual é titulo da pagina dinanmicamente se editando ou criando um recurso 
  serverErrorMessages: string[] = null;     //objeto que são as mensagens retornadoas do servidor
  submittingForm: boolean = false;          //objeto para desabilitar o botão de enviar 

  protected route: ActivatedRoute;          //rota 
  protected router: Router;                 //rotiador
  protected formBuilder: FormBuilder;       //construtor de formularios
  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T
  ) { 
    this.route = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);
  }

  //Executar em sequencia 
  ngOnInit() {
    this.setCurrentAction();    // para definir qual é ação a ser executada        
    this.buildResourceForm();   // construir um formulario
    this.loadResource();        // carregar a categoria em questão se tiver editando "categories/23"
  }
  //Eu garanto que vou setar o titulo da pagina apos todo carregamento de todos os dados terem sido efetuados
  ngAfterContentChecked(){
    this.setPageTitle();
  }
  
  // metodo chamdo quando usuario clicar no botão salvar ou enter.
  submitForm(){
    this.submittingForm = true;       //desbloquear o botão

    if(this.currentAction == "new")   //editando ou criando uma nova categoria
      this.createResource();
    else // currentAction == "edit"
      this.updateResource();
  }


  // PRIVATE METHODS
  
  //Função que verifica a rota para saber se ela esta editando ou não
  protected setCurrentAction() {
    if(this.route.snapshot.url[0].path == "new")       // "/categories/new"
      this.currentAction = "new"
    else
      this.currentAction = "edit"                      ///categories/
  }

  //verifica se acao atual for = edit faz a requisição no servidor para a categoria a ser editado
  protected loadResource() {
    if (this.currentAction == "edit") {
      
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get("id")))   //switchmap considera apenas a ultima requisição / + transforma num numero e se chama cast
      )
      .subscribe(
        (resource) => {
          this.resource = resource;
          this.resourceForm.patchValue(resource) // binds loaded resource data to resourceForm
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
      )
    }
  }

  //Seta de acordo com a ação coorente o titulo
  protected setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = this.creationPageTitle();
    else{
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected creationPageTitle(): string{
    return 'Novo'
  }

  protected editionPageTitle(): string{
    return 'Edição'
  }


  protected createResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);               // Object.assign(new Category(),this.categoryForm.value)=> Estou criando uma categoruia nova e preenchendo com as informações do formulario

    this.resourceService.create(resource)
      .subscribe(
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      )
  }


  protected updateResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.update(resource)
      .subscribe(
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      )
  }

  
  protected actionsForSuccess(resource: T){
    toastr.success("Solicitação processada com sucesso!");

    const baseComponentPath: string = this.route.snapshot.parent.url[0].path;

    // redirect/reload component page //força que o componente seja recarregado 
    this.router.navigateByUrl(baseComponentPath, {skipLocationChange: true}).then(                         //skipLocationChange objeto que diz para adicionar la no historico de navegação do navegador
      () => this.router.navigate([baseComponentPath, resource.id, "edit"])
    )
  }

  
  protected actionsForError(error){
    toastr.error("Ocorreu um erro ao processar a sua solicitação!");

    this.submittingForm = false;

    if(error.status === 422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde."]
  }


  protected abstract buildResourceForm(): void;
}
