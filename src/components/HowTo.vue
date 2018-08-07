<template>
    <div class="content">
        <div class="byline">
            {{ jsonvm.byLabel }} {{ jsonvm.author }}
        </div>
        <h1>{{ jsonvm.mainHeadline }}</h1>
        <p>
            Getting CMSs and Vue to work properly together often presents a few problems. Building Vue components that can contain other Vue components is a trivial 
            task, but how do we support CMSs that often has built in features for creating components that are able to nest other, abitrary components inside? 
        </p>
        <p>
            Many Vue examples are based on the idea that you are building an application in which you always know how the different "screens" in the application are 
            composed. In that case it is easy to have your Vue components compose other components as the structure is known in advance. In CMS the structure of any 
            given page might be determined by the editor and if we wish to use Vue components in that scenario we need to make sure that they are agnostic in 
            regards to their contents.
        </p>
        <p>
            The following is a suggestion as to how two of the most CMS centric problems can be solved in Vue without resorting to using inline templates: 1) creating
            Vue components that can compose arbitrary Vue components, and 2) making the content maintained in the CMS available to each component with a minimum of fuzz
            and boilerplate.
        </p>

        <h2>1) Dealing with arbitrary nested components</h2>
        <p>
            This part of the problem is solved using VueJS slots (read more here: <a href="https://vuejs.org/v2/guide/components-slots.html" target="_blank">https://vuejs.org/v2/guide/components-slots.html</a>). 
            Say that we have a HowTo component and we want that component to be able to render out nested components, we first need to add a slot to the template of
            the HowTo component:
        </p>
        <code class="code">
            <label class="code-label">{{ jsonvm.vueFileName }}</label>
&lt;template&gt;
    &lt;!-- regular content for the HowTo component here --&gt;
    &lt;slot&gt;
        &lt;!-- Nested components inserted by the editor will be rendered here --&gt;
    &lt;/slot&gt;
    &lt;!-- more regular content for the HowTo component here --&gt;
&lt;/template&gt;
        </code>
        
        <p>
            EPiServer view for the HowTo component in pseudo code. The view model is assumed to have a MainContentArea property which is an EPiServer ContentArea in which
            the editor may or may not have added components.
        </p>
        <code class="code">
            <label class="code-label">{{ jsonvm.viewFileName }}</label>
@model ViewModels.HowToViewModel
&lt;how-to&gt;
    @Html.PropertyFor(m =&gt; m.MainContentArea)
&lt;/how-to&gt;
        </code>

        <p>
            In this example, all components added to the MainContentArea in EPiServer will end up rendered out where the &lt;slot/&gt; tag is inserted in the HowTo.vue template.
        </p>

        <h2>2) Passing CMS content into the Vue components</h2>
        <p>
            So how about that CMS content? How do we get that passed into the Vue components? There are a couple of ways to do that:
        </p>
        <h3>Using props</h3>
        <p>
            Using props is the most straight forward way of doing this. This could look like this:
        </p>
        <code class="code">
            <label class="code-label">{{ jsonvm.viewFileName }}</label>
@model ViewModels.HowToViewModel
&lt;how-to
    main-headline="@Model.MainHeadline"
    vue-file-name="@Model.VueFileName"
    view-file-name="@Model.ViewFileName"
&gt;
    @Html.PropertyFor(m =&gt; m.MainContentArea)
&lt;/how-to&gt;
        </code>

        <p>
            While the corresponding Vue component could look like this:
        </p>
        <code class="code">
            <label class="code-label">{{ jsonvm.vueFileName }}</label>
&lt;template&gt;
    &lt;h1&gt;{&#8203;{ mainHeadline }}&lt;/h1&gt;
    
    &lt;code&gt;
        &lt;label&gt;{&#8203;{ vueFileName }}&lt;/label&gt;
        ...
    &lt;/code&gt;
    
    &lt;code&gt;
        &lt;label&gt;{&#8203;{ viewFileName }}&lt;/label&gt;
        ...
    &lt;/code&gt;

    &lt;slot&gt;
        &lt;!-- Nested components inserted by the editor will be rendered here --&gt;
    &lt;/slot&gt;
    &lt;!-- more regular content for the HowTo component here --&gt;
&lt;/template&gt;

&lt;script&gt;
    export default {
        props: [
            'mainHeadline',
            'vueFileName',
            'viewFileName'
        ]
    };
&lt;/script&gt;            
        </code>
        <p>
            This approach is a bit fragile. We need to make sure that there are no double quotes in the view model fields that we pass in through props as a double quote will break
            the html attribute. Furthermore, it will also require some additional serialization work if we wish to pass in an array from our view model. Lastly, we also have the discrepancy 
            where we have to use kebab case for the attributes in html and camel case for the props in the Vue components. Not a big problem but definitely one more place where it
            is easy to introduce a bug.
        </p>
        <p>
            An upside to this approach is that it is completely explicit which props are available to the Vue component as one can just take a look at the props array. Adding every single
            prop as matching kebab cased html attributes does take some work, though.
        </p>
        <p>
            There is also another way to pass in the view model data by using a named slot.
        </p>

        <h3>Using a named slot</h3>
        <p>
            It is also possible to pass in the entire view model into the Vue component by using a named slot and serializing the view model to JSON. In order to do so, we need to modify the 
            server side view to render like this (again, EPiServer pseudo code is used):
        </p>
        <code class="code">
            <label class="code-label">{{ jsonvm.viewFileName }}</label>
@model ViewModels.HowToViewModel
&lt;how-to&gt;
    &lt;template slot="jsonvm"&gt;
        @Model.ToJson()
    &lt;/template&gt;
    @Html.PropertyFor(m =&gt; m.MainContentArea)
&lt;/how-to&gt;
        </code>
        
        <p>
            The Vue component should then be modified like this:
        </p>
        <code class="code">
            <label class="code-label">HowTo.vue</label>
&lt;template&gt;
    &lt;h1&gt;{&#8203;{ jsonvm.mainHeadline }}&lt;/h1&gt;
    
    &lt;code&gt;
        &lt;label&gt;{&#8203;{ jsonvm.vueFileName }}&lt;/label&gt;
        ...
    &lt;/code&gt;
    
    &lt;code&gt;
        &lt;label&gt;{&#8203;{ jsonvm.viewFileName }}&lt;/label&gt;
        ...
    &lt;/code&gt;

    &lt;slot&gt;
        &lt;!-- Nested components inserted by the editor will be rendered here --&gt;
    &lt;/slot&gt;
    &lt;!-- more regular content for the HowTo component here --&gt;
&lt;/template&gt;

&lt;script&gt;
    import JsonVM from '../mixins/jsonvm';
    export default {
        mixins: [
            JsonVM
        ]
    };
&lt;/script&gt;            
        </code>
        
        <p>
            The JsonVM is a mixin that will a jsonvm data attribute to the Vue component. That attribute will contain the whole view model as a javascript object as
            it has been parsed from the JSON that was rendered out in the jsonvm slot in HowTo.cshtml. The mixin is probably also worth a look:
        </p>
        <code class="code">
            <label class="code-label">jsonvm.js</label>
export default {
    data: function () {
        return {
            jsonvm: this.$slots &amp;&amp; this.$slots['jsonvm'] &amp;&amp; this.$slots['jsonvm'][0] ? JSON.parse(this.$slots['jsonvm'][0].text) : {}
        }
    }
};
        </code>
        <p>
            Note that the JSON that is rendered out in the jsonvm slot need to valid JSON - ie. the property names need to be enclosed in double quotes.
        </p>
        <p>
            Using this approach means that it is no longer explicit which properties are available in to the Vue component. Using the mixin means that 
            we know there will be a jsonvm propery on the component but there is no telling what that jsonvm object contains without consulting
            the view model that is rendered out server side.
        </p>
        
        <!-- slot for rendering out child components -->
        <slot></slot>

    </div>
</template>

<script>
import JsonVM from '../mixins/jsonvm';

export default {
    mixins: [
        JsonVM
    ],
    data: function () {
        return {

        };
    }
}

</script>

<style scoped>
    .content {
        text-align: left;
        padding: 2em;
    }
    .code {
        display: block;
        position: relative;
        white-space: pre-wrap;
        padding: 2em 1em 1em;
        background: LemonChiffon;
    }
    .code-label {
        position: absolute;
        top: 0.5em;
        left: 1em;
        font-style: italic;
    }
    .byline {
        text-align: right;
    }
</style>