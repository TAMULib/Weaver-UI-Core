describe('core.version module', function () {
    beforeEach(module('core.version'));

    describe('version service', function () {
        it('should return current version', inject(function (version) {
            expect(version).toEqual(coreConfig.version);
        }));
    });
});