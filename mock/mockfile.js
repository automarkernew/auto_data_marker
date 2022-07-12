const Mock = require('mockjs');

module.exports = () => {
    var data = Mock.mock({
        "dataMarkerInfomationList": {
            "dataMarkerInfomation|33": [
                {
                    "markInfomationId|+1": 1000,
                    "sensorType|1": ["VIS-可见光", "IR-红外光", "SAR-SAR图像", "HIS-高光谱"],
                    "shootTime": '@datetime("yyyy-MM-dd HH:mm:ss")',
                    "shootPlace|1": ["深大", "罗浮山"],
                    "markState|1": ['未标注', '部分标注', '已标注'],
                    "markPerson": "@cname",
                    "markTime": '@datetime("yyyy-MM-dd HH:mm:ss")',
                    "fileUrl": "@url"
                }
            ]
        },
        // "videoInformation/create"

        // "videoInformation/query"
        "videoInformationquery": {
            "VideoInformationQueryRspq|23": [
                {
                    "videoId|+1": 1000,
                    "videoName|": "@name",
                    "videoFileUrl|1": ["@url", "https://www.runoob.com/try/demo_source/movie.ogg"],
                    "shootTime": "@datetime('yyyy-MM-dd HH:mm:ss')",
                    "shootPlace|1": ["深大", "罗浮山"],
                    "length": "random()",
                    "sensorType|1": ["VIS", "IR", "SAR", "HIS"],
                    //["VIS-可见光","IR-红外光","SAR-SAR图像","HIS-高光谱"],
                    "height|50-500": 1,
                    "width|100-1000": 1,
                    "tagUserId|1000-20000": 1,
                    "motUserId|1000-20000": 1,
                    "tagImgUrl": "@url",
                    "motImgUrl": "@url",
                    "tagTime": "@datetime('yyyy-MM-dd HH:mm:ss')",
                    "tagStatus|1": ['未标注', '部分标注', '已标注'],
                    "isTagged": true,
                    "isMoted": false,
                }
            ]
        },

        //visibleTagging/upload
        "visibleTaggingupload": {
            "asdf": {
                name: "niuniu"
            },
            "data": {
                "shootTime": "@datetime('yyyy-MM-dd HH:mm:ss')",
                "shootPlace|1": ["深大", "罗浮山"],
                "length": "random()",
                "sensorType|1": ["VIS", "IR", "SAR", "HIS"],
            }
        },

        "TargetTrackgetlist": {
            "data": {
                "QuerySummaryRsp": {
                    "dataAmount": 10
                },
                "TargetTrackGetListRsp|30": [
                    {
                        "videoId|200134123-300134123": 2,
                        "videoName|2-6": "@cword",
                        "sensorType|1": ["VIS", "HSI", "SAR", "IR", "HR"],
                        "shootTime": "@datetime('yyyyMMddhhmmss')",
                        "objectTypeList": ["库房", "飞机", "坦克", "汽车"],
                        "target": [
                            {
                                "objectType|1": ["库房", "飞机", "坦克", "汽车"],
                                "uniqueId": "@id"
                            },
                        ]
                    }
                ]
            }

        }
    });

    return data;
}