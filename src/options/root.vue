<template>
    <div class="page page-options">
        <ui-appbar class="appbar" title="设置"></ui-appbar>
        <div class="body">
            <div class="container">
                <h2 class="sub-title">外观设置</h2>
                <ui-list class="setting-list">
                    <ui-list-item disableRipple title="显示搜索框">
                        <ui-switch :value="userSetting.searchVisible" slot="right" @change="() => handleToggle('searchVisible')" />
                    </ui-list-item>
                    <ui-list-item disableRipple title="显示快捷图标">
                        <ui-switch :value="userSetting.shortCutVisible" slot="right" @change="() => handleToggle('shortCutVisible')" />
                    </ui-list-item>
                    <ui-list-item disableRipple title="显示待办">
                        <ui-switch :value="userSetting.todoVisible" slot="right" @change="() => handleToggle('todoVisible')" />
                    </ui-list-item>
                </ui-list>

                <h2 class="sub-title">其他</h2>

                <ui-list class="setting-list">
                    <ui-list-item disableRipple href="https://extension.yunser.com/" target="_blank" title="官网">
                    </ui-list-item>
                    <ui-list-item disableRipple href="https://project.yunser.com/products/ed7006403cc011e9ae11c3584647d0bc" target="_blank" title="帮助">
                    </ui-list-item>
                    <ui-list-item disableRipple @click="clearStorage" title="清除数据">
                    </ui-list-item>
                    <ui-list-item disableRipple title="v1.0.5">
                    </ui-list-item>
                </ui-list>
                
                <!-- <img src="/static/img/icon.png" @click="test"> -->
                <textarea v-model="input"></textarea>
                <button @click="addNote">添加笔记</button>
                <h2 class="section-title">笔记列表</h2>
                <ul class="note-list">
                    <li class="item" v-for="item, index in notes">
                        {{ item.content }}
                        <div @click="remove(item, index)">删除</div>
                    </li>
                </ul>
                <h2 class="section-title">我的插件</h2>
                <ul class="widget-list">
                    <li class="item" v-for="item, index in myWidgets">
                        {{ item.name }}

                        <div @click="removeWidget(item, index)">删除</div>
                    </li>
                </ul>
                <h2 class="section-title">插件市场</h2>
                <ul class="widget-list">
                    <li class="item" v-for="item, index in widgets">
                        {{ item.name }}
                        <div @click="addWidget(item, index)">添加</div>
                        <!-- <div @click="remove(item, index)">删除</div> -->
                    </li>
                </ul>
                <h2 class="section-title">我的搜索</h2>
                <ul class="widget-list">
                    <li class="item" v-for="item, index in searchTypes">
                        {{ item.name }}

                        <div @click="removeSearch(item, index)">删除</div>
                    </li>
                </ul>
            </div>
            <!-- <ui-text-field v-model="imagePageBgColor" lable="图片背景色" /> -->
        </div>
    </div>
</template>

<script>
    /* eslint-disable */
    import entend from '../util/extend'
    import defaultSetting from '../util/setting'

    export default {
        data() {
            return {
                userSetting: defaultSetting,
                editType: 'create',
                input: '',
                notes: [],
                searchTypes: [],
                myWidgets: [
                    {
                        id: '1',
                        name: '日期',
                        url: 'https://nodeapi.yunser.net/date',
                        content: '',
                    },
                ],
                widgets: [
                    {
                        id: '1',
                        name: '日期',
                        url: 'https://nodeapi.yunser.net/date',
                        content: '',
                    },
                    {
                        id: '2',
                        name: '时间',
                        url: 'https://nodeapi.yunser.com/time?format=text',
                        content: '',
                    },
                    {
                        id: '3',
                        name: '时间记录',
                        url: 'https://nodeapi.yunser.com/record/widget',
                        content: '',
                        more: 'https://record.yunser.com/record'
                    },
                    {
                        id: '4',
                        name: 'UUID',
                        url: 'https://nodeapi.yunser.com/uuid',
                        content: '',
                        more: 'https://util.yunser.com/uuid'
                    },
                    {
                        id: '5',
                        name: '随机数',
                        url: 'https://nodeapi.yunser.com/random',
                        content: '',
                        more: 'https://math.yunser.com/random/generator'
                    },
                    {
                        id: '6',
                        name: '骰子',
                        url: 'https://nodeapi.yunser.com/dice',
                        content: '',
                        more: 'https://math.yunser.com/dice'
                    },
                    {
                        id: '7',
                        name: '抛硬币',
                        url: 'https://nodeapi.yunser.com/coin/widget',
                        content: '',
                        more: 'https://math.yunser.com/dice'
                    },
                    {
                        id: '8',
                        name: '一言',
                        url: 'https://nodeapi.yunser.com/saying?format=text',
                        content: '',
                        // more: 'https://math.yunser.com/dice' // TODO
                    },
                ],
            }
        },
        computed: {},
        created () {},
        mounted () {
            this.loadData()
        },
        methods: {
            clearStorage() {
                let ret = confirm('清除数据？')
                if (ret) {
                    localStorage.clear()
                }
            },
            handleToggle(key) {
                // e.stopPropagation()
                // e.preventDefault()
                console.log('设置了', key)
                this.userSetting[key] = !this.userSetting[key]
                console.log('保存', this.userSetting)
                this.$storage.set('userSetting', this.userSetting)
            },
            loadData() {
                console.log('123456')
                this.userSetting = entend(defaultSetting, this.$storage.get('userSetting', {}))
                console.log('读取的配置', this.userSetting)
                
                this.searchTypes = this.$storage.get('searchTypes', this.searchTypes)
                this.myWidgets = this.$storage.get('widgets', [])
                this.notes = this.$storage.get('notes', [])
            },
            test() {
                alert('test')
            },
            remove(item, index) {
                this.notes.splice(index, 1)
                this.$storage.set('notes', this.notes)
            },
            addNote() {
                if (!this.input) {
                    this.$message({
                        type: 'danger',
                        text: '请输入内容'
                    })
                    return
                }
                if (this.editType === 'create') {
                    let list = this.$storage.get('notes', [])
                    list.unshift({
                        id: '' + new Date().getTime(),
                        content: this.input,
                        createTime: new Date()
                    })
                    this.$storage.set('notes', list)
                    this.input = ''
                    this.loadData()
                } else {
                    
                }
            },
            addWidget(item) {
                this.myWidgets.push(item)
                this.$storage.set('widgets', this.myWidgets)
            },
            removeWidget(item, index) {
                this.myWidgets.splice(index, 1)
                this.$storage.set('widgets', this.myWidgets)
            },
            removeSearch(item, index) {
                this.searchTypes.splice(index, 1)
                this.$storage.set('searchTypes', this.searchTypes)

                // this.searchTypes = this.$storage.get('searchTypes', this.searchTypes)
            }
        }
    }
</script>

<style lang="scss">
    .page-options {
        padding-top: 64px;
        background-color: #f1f1f1;
    }
    .appbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
    }
    // * {
    //     margin: 0;
    //     padding: 0;
    //     box-sizing: border-box;
    //     font-size: 14px;
    //     color: #333;
    // }
    .container {
        max-width: 400px;
        margin: 0 auto;
    }
    .sub-title {
        font-size: 16px;
        margin: 16px 0;
    }
    .setting-list {
        background-color: #f9f9f9;
        border: 1px solid #eee;
        border-radius: 4px;
    }
    .section-title {
        font-weight: bold;
        font-size: 24px;
    }
    .page {
    }
    .app-list {
        display: flex;
    }
    .body {
        padding: 16px;
    }
    .note-list {
        .item {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #000;
        }
    }
    .widget-list {
        .item {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #000;
        }
    }
</style>