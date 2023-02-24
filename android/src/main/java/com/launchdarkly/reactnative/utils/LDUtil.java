package com.launchdarkly.reactnative.utils;

import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.launchdarkly.sdk.ArrayBuilder;
import com.launchdarkly.sdk.ContextBuilder;
import com.launchdarkly.sdk.ContextKind;
import com.launchdarkly.sdk.ContextMultiBuilder;
import com.launchdarkly.sdk.LDContext;
import com.launchdarkly.sdk.LDValue;
import com.launchdarkly.sdk.ObjectBuilder;

import java.lang.reflect.Method;
import java.util.ArrayList;

public class LDUtil {
    public static boolean validateConfig(String key, ReadableMap config, ReadableType type) {
        return config.hasKey(key) && config.getType(key) == type;
    }

    public static LDContext configureContext(ReadableMap map) {
        String kind = null;
        if (validateConfig("kind", map, ReadableType.String)) {
            kind = map.getString("kind");
        }

        if (kind.equals("multi")) {
            ContextMultiBuilder b = LDContext.multiBuilder();
            ReadableMapKeySetIterator mapKeys = map.keySetIterator();

            while (mapKeys.hasNextKey()) {
                String k = mapKeys.nextKey();
                if (!k.equals("kind")) {
                    b.add(createSingleContext(map.getMap(k), k));
                }
            }

            return b.build();
        } else { // single
            return createSingleContext(map, kind);
        }
    }

    public static LDContext createSingleContext(ReadableMap map, String kind) {
        Boolean anonymous = null;
        if (validateConfig("anonymous", map, ReadableType.Boolean)) {
            anonymous = map.getBoolean("anonymous");
        }

        String key = null;
        if (validateConfig("key", map, ReadableType.String)) {
            key = map.getString("key");
        }

        // force a placeholder key if anonymous and none is specified
        if (anonymous != null && anonymous && key == null) {
            key = "__LD_PLACEHOLDER_KEY__";
        }

        ContextBuilder b = LDContext.builder(ContextKind.of(kind), key);

        if (anonymous != null) {
            b.anonymous(anonymous);
        }
        
        String name = null;
        if (validateConfig("name", map, ReadableType.String)) {
            name = map.getString("name");
            b.name(name);
        }

        if (validateConfig("_meta", map, ReadableType.Map)) {
            b.privateAttributes(getPrivateAttributesArray(map.getMap("_meta")));
        }

        // arbitrary attributes
        ReadableMapKeySetIterator mapKeys = map.keySetIterator();
        while (mapKeys.hasNextKey()) {
            String k = mapKeys.nextKey();

            // ignore built-in attributes
            if (!k.equals("kind") && !k.equals("key") && !k.equals("name") && !k.equals("anonymous") && !k.equals("_meta")) {
                LDValue v = toLDValue(map.getDynamic(k));
                b.set(k, v);
            }
        }

        return b.build();
    }

    public static String[] getPrivateAttributesArray(ReadableMap map) {
        ArrayList<String> list = new ArrayList<>();
        if (validateConfig("privateAttributes", map, ReadableType.Array)) {
            ReadableArray arr = map.getArray("privateAttributes");
            for (int i = 0; i < arr.size(); i++) {
                if (arr.getType(i) == ReadableType.String) {
                    list.add(arr.getString(i));
                }
            }
        }

        return list.toArray(new String[list.size()]);
    }


    public static LDValue toLDValue(Dynamic data) {
        if (data == null) {
            return LDValue.ofNull();
        }
        switch (data.getType()) {
            case Boolean:
                return LDValue.of(data.asBoolean());
            case Number:
                return LDValue.of(data.asDouble());
            case String:
                return LDValue.of(data.asString());
            case Array:
                return toLDValue(data.asArray());
            case Map:
                return toLDValue(data.asMap());
            default:
                return LDValue.ofNull();
        }
    }

    public static LDValue toLDValue(ReadableArray readableArray) {
        ArrayBuilder array = LDValue.buildArray();
        for (int i = 0; i < readableArray.size(); i++) {
            array.add(toLDValue(readableArray.getDynamic(i)));
        }
        return array.build();
    }

    public static LDValue toLDValue(ReadableMap readableMap) {
        ObjectBuilder object = LDValue.buildObject();
        ReadableMapKeySetIterator iter = readableMap.keySetIterator();
        while (iter.hasNextKey()) {
            String key = iter.nextKey();
            object.put(key, toLDValue(readableMap.getDynamic(key)));
        }
        return object.build();
    }

    public static Object ldValueToBridge(LDValue value) {
        switch (value.getType()) {
            case BOOLEAN:
                return value.booleanValue();
            case NUMBER:
                return value.doubleValue();
            case STRING:
                return value.stringValue();
            case ARRAY:
                return ldValueToArray(value);
            case OBJECT:
                return ldValueToMap(value);
            default:
                return null;
        }
    }

    public static WritableArray ldValueToArray(LDValue value) {
        WritableArray result = new WritableNativeArray();
        for (LDValue val : value.values()) {
            switch (val.getType()) {
                case NULL:
                    result.pushNull();
                    break;
                case BOOLEAN:
                    result.pushBoolean(val.booleanValue());
                    break;
                case NUMBER:
                    result.pushDouble(val.doubleValue());
                    break;
                case STRING:
                    result.pushString(val.stringValue());
                    break;
                case ARRAY:
                    result.pushArray(ldValueToArray(val));
                    break;
                case OBJECT:
                    result.pushMap(ldValueToMap(val));
                    break;
            }
        }
        return result;
    }

    public static WritableMap ldValueToMap(LDValue value) {
        WritableMap result = new WritableNativeMap();
        for (String key : value.keys()) {
            LDValue val = value.get(key);
            switch (val.getType()) {
                case NULL:
                    result.putNull(key);
                    break;
                case BOOLEAN:
                    result.putBoolean(key, val.booleanValue());
                    break;
                case NUMBER:
                    result.putDouble(key, val.doubleValue());
                    break;
                case STRING:
                    result.putString(key, val.stringValue());
                    break;
                case ARRAY:
                    result.putArray(key, ldValueToArray(val));
                    break;
                case OBJECT:
                    result.putMap(key, ldValueToMap(val));
                    break;
            }
        }
        return result;
    }

    public static Method findSetter(Class cls, String methodName) {
        for (Method method : cls.getMethods()) {
            if (method.getName().equals(methodName) && method.getParameterTypes().length == 1)
                return method;
        }
        return null;
    }
}
