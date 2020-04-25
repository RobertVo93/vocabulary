import { environment } from 'src/environments/environment'

export class Config {
    constructor(){}
    layout = {
        oneCol: '1 Cols',
        threeCol: '3 Cols'
    }

    viewColumns = {
        word: 'word',
        type: 'type',
        pronun: 'pronun',
        meaning: 'meaning',
        example: 'example',
        title: 'title',
        kanji: 'kanji',
        chinaMeaning: 'chinaMeaning',
        remember: 'remember',
        fullName: 'fullName',
        lastModifiedDate: 'lastModifiedDate',
        order: 'order',
        explain: 'explain',
        JLPTLevel: 'JLPTLevel',
        fullMeaning: 'fullMeaning',
        name: 'name',
        createdDate: 'createdDate',
        createdBy: 'createdBy',
        updatedDate: 'updatedDate',
        updatedBy: 'updatedBy',
        id: 'id',
        select: 'select',
        email: 'email',
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
        language: 'language',
        address: 'address',
        phone: 'phone',
        role: 'role',
        exampleMeaning: 'exampleMeaning',
        kanjiExplain: 'kanjiExplain',
        tags: 'tags',
        dataSource: 'dataSource'
    }

    viewColumnsDef = {
        word: 1,
        type: 2,
        pronun: 3,
        meaning: 4,
        example: 5,
        title: 6,
        kanji: 7,
        chinaMeaning: 8,
        remember: 9,
        fullName: 10,
        lastModifiedDate: 11,
        order: 12,
        explain: 13,
        JLPTLevel: 14,
        fullMeaning: 15,
        name: 16,
        createdDate: 17,
        createdBy: 18,
        updatedDate: 19,
        updatedBy: 20,
        id: 21,
        select: 22,
        email: 23,
        password: 24,
        firstName: 25,
        lastName: 26,
        language: 27,
        address: 28,
        phone: 29,
        role: 30,
        exampleMeaning: 31,
        kanjiExplain: 32,
        tags: 33,
        dataSource: 34

    }

    optionValue = {
        createNew: 1,
        delete: 2,
        update: 3
    }

    optionViewValue = {
        createNew: 'Create New',
        delete: 'Delete',
        update: 'Update'
    }

    pubSubKey = {
        dataTraining: 'dataTraining',
        datasetId: 'dataSetId',
        currentTrainingWordIndex: 'currentTrainingWordIndex'
    }

    dataSetFileName = {
        duolingo: 'duolingo',
        mimikara: 'mimikara',
        minanoNihongo: 'minanoNihongo',
        collection: 'collection',
        sourceFile: 'src/dataset/',
        kanji: 'kanji'
    }

    color = {
        blue: 'blue',
        red: 'red',
        bgTrainedRowColor: 'rosybrown',
        bgDardGray: 'darkgray'
    }

    keyBoardKey = {
        enter: 'Enter'
    }

    testMode = {
        newWord: 'new word',
        meaning: 'meaning',
        image: 'image',
        kanji: 'kanji'
    }

    excelTemplateFields = {
        word: 'word',
        type: 'type',
        meaning: 'meaning',
        example: 'example',
        title: 'title',
        pronun: 'pronun',
        kanji: 'kanji',
        image: 'image',
        kanjiExplain: 'kanjiexplain',
        chinaMeaning: 'china'
    }

    kanjiLevels = {
        kanjiAll: -1,
        kanjiNone: 0,
        kanjiN1: 1,
        kanjiN2: 2,
        kanjiN3: 3,
        kanjiN4: 4,
        kanjiN5: 5
    }

    cookieKeyName = {
        updatedRecordsKey: 'updaatedRecordsKey'
    }
    
    apiServiceURL = {
        tags: `${environment.serverURL}/tags`,
        users: `${environment.serverURL}/users`,
        dataSources: `${environment.serverURL}/dataSources`,
        roles: `${environment.serverURL}/roles`,
        languages: `${environment.serverURL}/languages`,
        words: `${environment.serverURL}/words`,
        upload: `${environment.serverURL}/upload`,
        server: `${environment.serverURL}`
    }

    returnAction = {
        save: "SAVE",
        cancel: "CANCEL",
        delete: "DELETE",
        update: "UPDATE"
    }

    commonMessage = {
        confirmation: 'Confirmation',
        notification: 'Notification',
        alert: 'Alert',
        deleteRecordConfirmation: 'Delete the selected record(s)?',
        updateRecordConfirmation: 'Update the selected record(s)?',
        deleteSuccessfull: 'Delete successfully!',
        deleteError: 'Delete error!!!',
        updateSuccessfull: 'Update successfully!',
        updateError: 'Update error!!!',
        createSuccessfull: 'Create record successfully',
        createError: 'Create record error'
    }

    dataTypeDef = {
        date: "DATE",
        string: "STRING",
        number: "NUMBER",
        boolean: "BOOLEAN",
        dropdown: "DROPDOWN"
    }

    formValidators = {          //the understand the value => refer the attributes of Validators in angular form, see in question-control.service.ts
        require: "required",
        minLength: "minLength",
        maxLength: "maxLength",
        email: "email"
    }

    inputTypeDef = {
        button: 'button',
        checkbox: 'checkbox',
        color: 'color',
        date: 'date',
        datetime: 'datetime',
        datetimeLocal: 'datetime-local',
        email: 'email',
        file: 'file',
        hidden: 'hidden',
        image: 'image',
        month: 'month',
        number: 'number',
        password: 'password',
        radio: 'radio',
        range: 'range',
        reset: 'reset',
        search: 'search',
        submit: 'submit',
        tel: 'tel',
        text: 'text',
        time: 'time',
        url: 'url',
        week: 'week'
    }

    wordType = {
        prep: 1,
        noun: 2,
        adjective: 3,
        verb: 4,
        adverd: 5
    }
}