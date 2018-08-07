<template>
    <div>
        <h3>{{ jsonvm.headline }}</h3>
        <ul>
            <li v-for="(link, index) in jsonvm.links" :key="index">
                <a :href="link.href">{{ link.text }}</a>
            </li>
        </ul>
    </div>
</template>

<script>
import JsonVM from '../mixins/jsonvm';

export default  {
    name: 'LinkList',
    mixins: [ JsonVM ],
};

</script>
