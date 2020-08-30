(function (Vue) {

	const STORAGE_KEY = 'items-vue'
	const itemStorage = {
		fetch(){
			// 将JSON数据转换为数组
			return JSON.parse( localStorage.getItem(STORAGE_KEY) || '[]')
		},
		save(items){
			localStorage.setItem(STORAGE_KEY,JSON.stringify(items))
		}
	}


	// const items = [
	// 	{
	// 		id: 1,
	// 		content:'Vue.js',
	// 		completed:true
	// 	},
	// 	{
	// 		id: 2,
	// 		content:'bootStrap.js',
	// 		completed:true
	// 	},
	// 	{
	// 		id: 3,
	// 		content:'python',
	// 		completed:true
	// 	},
	// 	{
	// 		id: 4,
	// 		content:'java',
	// 		completed:false
	// 	}
	// ]

	// 自定义全局指令
	Vue.directive('app-focus',{
		inserted (el, binding){
			el.focus()
		},
		update(el,binding) {
			el.focus()
		},
	})

	var vm = new Vue({
		el:'#todoapp',
		data(){
			return {
				items:itemStorage.fetch(),
				currentItem: null,
				filterStatus:'all'
			}
		},

		watch: {
			items:{
				deep:true,
				handler(newItems, oldItems){
					itemStorage.save(newItems)
				}
			}
		},

		computed:{
			toggleAll:{
				get(){
					return !this.remain
					
				},
				set(newStatus){
					console.log(this.remain);
					this.items.forEach(item => {
						item.completed = newStatus
					})
				}
			},
			remain(){
				return this.items.filter(function(item){
					return !item.completed
				}).length
				
			},
			filterItem(){
				switch (this.filterStatus) {
					case 'active':
						return this.items.filter(item => !item.completed)
						break;
					case 'completed':
						return this.items.filter(item => item.completed)
						break;
					default:
						return this.items
						break;
				}
			}
		},

		methods: {
			del(index){
				this.items.splice(index,1)
			},
			addItem(event){
				if(event.target.value.trim()){
					this.items.push({id:this.items.length+1,content:event.target.value,completed:false})
					event.target.value = ''
				}
			},
			remove(){
				this.items = this.items.filter(item => {
					return !item.completed
				})	
				
			},
			toEdit(item){
				this.currentItem = item
			},
			cancleEdit(){
				this.currentItem = null
			},
			finshEdit(item, $event,index){
				if(!$event.target.value.trim()){
					this.items.splice(index,1)
					return					
				}
				item.content = $event.target.value
				this.currentItem = null
			}
		},
	})

	window.onhashchange = function(){
		const hash = window.location.hash.substr(2) || 'all'
		vm.filterStatus = hash
		console.log(hash);
		
	}


})(Vue);
