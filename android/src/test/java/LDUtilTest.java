import static com.launchdarkly.reactnative.utils.LDUtil.configureContext;
import static com.launchdarkly.reactnative.utils.LDUtil.createSingleContext;
import static com.launchdarkly.reactnative.utils.LDUtil.validateConfig;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.facebook.react.bridge.JavaOnlyArray;
import com.facebook.react.bridge.JavaOnlyMap;
import com.facebook.react.bridge.ReadableType;
import com.launchdarkly.sdk.LDContext;

import org.junit.Test;

public class LDUtilTest {
    private JavaOnlyMap createAnonymousNoKey() {
        JavaOnlyMap configMap = new JavaOnlyMap();
        configMap.putString("kind", "employee");
        configMap.putBoolean("anonymous", true);
        configMap.putString("name", "Yus");

        return configMap;
    }

    private JavaOnlyMap createEmployeeContextMap() {
        JavaOnlyMap configMap = new JavaOnlyMap();
        configMap.putString("kind", "employee");
        configMap.putString("key", "blr123");
        configMap.putBoolean("anonymous", true);
        configMap.putString("name", "Yus");
        configMap.putInt("employeeNumber", 55);
        configMap.putBoolean("isActive", true);

        JavaOnlyMap addressMap = new JavaOnlyMap();
        addressMap.putString("street", "Sunset Blvd");
        addressMap.putInt("number", 321);
        configMap.putMap("address", addressMap);

        return configMap;
    }

    private JavaOnlyMap createOrgContextMap() {
        JavaOnlyMap configMap = new JavaOnlyMap();
        configMap.putString("kind", "org");
        configMap.putString("key", "qf32");
        configMap.putString("name", "Qantas");
        configMap.putInt("employeeCount", 10000);
        configMap.putBoolean("isInternational", true);

        JavaOnlyMap addressMap = new JavaOnlyMap();
        addressMap.putString("street", "Bourke St");
        addressMap.putInt("number", 22);
        addressMap.putString("country", "Australia");
        configMap.putMap("address", addressMap);

        return configMap;
    }

    private JavaOnlyMap createMultiContextMap() {
        JavaOnlyMap multi = new JavaOnlyMap();
        multi.putString("kind", "multi");
        multi.putMap("employee", createEmployeeContextMap());
        multi.putMap("org", createOrgContextMap());
        return multi;
    }

    @Test
    public void testValidateConfig() {
        JavaOnlyMap configMap = createEmployeeContextMap();

        assertFalse(validateConfig("stream", configMap, ReadableType.Boolean));
        assertTrue(validateConfig("kind", configMap, ReadableType.String));
        assertTrue(validateConfig("key", configMap, ReadableType.String));
    }

    @Test
    public void testCreateSingleContextSuccess() {
        JavaOnlyMap configMap = createEmployeeContextMap();
        LDContext c = createSingleContext(configMap, "employee");

        assertTrue(c.isValid());
        assertEquals("employee", c.getKind().toString());
        assertEquals("blr123", c.getKey());
        assertTrue(c.isAnonymous());
        assertEquals("Yus", c.getName());
        assertEquals(55, c.getValue("employeeNumber").intValue());
        assertTrue(c.getValue("isActive").booleanValue());
        assertEquals("{\"kind\":\"employee\",\"key\":\"blr123\",\"name\":\"Yus\",\"anonymous\":true,\"address\":{\"number\":321,\"street\":\"Sunset Blvd\"},\"isActive\":true,\"employeeNumber\":55}", c.toString());
    }

    @Test
    public void testCreateSingleContextNoKey() {
        JavaOnlyMap configMap = new JavaOnlyMap();
        LDContext c = createSingleContext(configMap, "employee");

        assertFalse(c.isValid());
    }

    @Test
    public void testAnonymousNoKey() {
        LDContext c = createSingleContext(createAnonymousNoKey(), "employee");

        assertTrue(c.isValid());
        assertTrue(c.isAnonymous());
        assertEquals("__LD_PLACEHOLDER_KEY__", c.getKey());
    }

    @Test
    public void testCreateSingleContextWithMeta() {
        JavaOnlyMap configMap = createEmployeeContextMap();

        JavaOnlyMap metaMap = new JavaOnlyMap();
        JavaOnlyArray arr = new JavaOnlyArray();
        arr.pushString("employeeNumber");
        arr.pushString("address");
        metaMap.putArray("privateAttributes", arr);
        configMap.putMap("_meta", metaMap);

        LDContext c = createSingleContext(configMap, "employee");

        assertTrue(c.isValid());
        assertEquals(2, c.getPrivateAttributeCount());
        assertEquals("{\"kind\":\"employee\",\"key\":\"blr123\",\"name\":\"Yus\",\"anonymous\":true,\"address\":{\"number\":321,\"street\":\"Sunset Blvd\"},\"isActive\":true,\"employeeNumber\":55,\"_meta\":{\"privateAttributes\":[\"employeeNumber\",\"address\"]}}", c.toString());
    }

    @Test
    public void testMultiContextSuccess() {
        LDContext c = configureContext(createMultiContextMap());

        assertTrue(c.isValid());
        assertEquals("{\"kind\":\"multi\",\"employee\":{\"key\":\"blr123\",\"name\":\"Yus\",\"anonymous\":true,\"address\":{\"number\":321,\"street\":\"Sunset Blvd\"},\"isActive\":true,\"employeeNumber\":55},\"org\":{\"key\":\"qf32\",\"name\":\"Qantas\",\"address\":{\"number\":22,\"country\":\"Australia\",\"street\":\"Bourke St\"},\"isInternational\":true,\"employeeCount\":10000}}", c.toString());
    }
}
